Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Extract parameters from request body
        const requestData = await req.json();
        const { templateId, exportFormat, dateRange, accountIds, customFilters } = requestData;

        if (!templateId || !exportFormat) {
            throw new Error('Template ID and export format are required');
        }

        // Validate export format
        const validFormats = ['pdf', 'excel', 'csv'];
        if (!validFormats.includes(exportFormat.toLowerCase())) {
            throw new Error('Invalid export format. Supported: PDF, Excel, CSV');
        }

        // Get Supabase credentials
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Fetch export template
        const templateResponse = await fetch(`${supabaseUrl}/rest/v1/export_templates?id=eq.${templateId}&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!templateResponse.ok) {
            throw new Error('Failed to fetch export template');
        }

        const templates = await templateResponse.json();
        if (templates.length === 0) {
            throw new Error('Export template not found');
        }

        const template = templates[0];

        // Verify user access to template
        if (template.user_id !== userId && !template.is_public) {
            throw new Error('Access denied to this template');
        }

        // Extract data sources from template config
        const dataSources = template.data_sources || [];
        const templateConfig = template.template_config || {};
        const filters = { ...template.filters, ...customFilters };

        // Collect data from specified sources
        const exportData = {};
        
        for (const source of dataSources) {
            const tableName = source.table;
            const columns = source.columns || '*';
            
            // Build query URL with filters
            let queryUrl = `${supabaseUrl}/rest/v1/${tableName}?select=${columns}`;
            
            // Apply date range filter if specified
            if (dateRange && source.date_column) {
                queryUrl += `&${source.date_column}=gte.${dateRange.start}&${source.date_column}=lte.${dateRange.end}`;
            }
            
            // Apply account filters if specified
            if (accountIds && accountIds.length > 0 && source.account_column) {
                queryUrl += `&${source.account_column}=in.(${accountIds.join(',')})`;
            }
            
            // Apply custom filters
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null) {
                    queryUrl += `&${key}=eq.${value}`;
                }
            }

            const dataResponse = await fetch(queryUrl, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!dataResponse.ok) {
                console.error(`Failed to fetch data from ${tableName}`);
                continue;
            }

            const data = await dataResponse.json();
            exportData[tableName] = data;
        }

        // Generate export content based on format
        let exportContent = '';
        let fileName = `${template.template_name}_${new Date().toISOString().split('T')[0]}`;
        let mimeType = '';

        switch (exportFormat.toLowerCase()) {
            case 'csv':
                exportContent = generateCSV(exportData, templateConfig);
                fileName += '.csv';
                mimeType = 'text/csv';
                break;
            case 'excel':
                exportContent = generateExcelData(exportData, templateConfig);
                fileName += '.xlsx';
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'pdf':
                exportContent = generatePDFData(exportData, templateConfig);
                fileName += '.pdf';
                mimeType = 'application/pdf';
                break;
        }

        // Upload file to storage
        const timestamp = Date.now();
        const storagePath = `exports/${userId}/${timestamp}-${fileName}`;

        // Convert content to binary data
        let binaryData: Uint8Array;
        if (exportFormat.toLowerCase() === 'csv') {
            binaryData = new TextEncoder().encode(exportContent);
        } else {
            // For Excel and PDF, content should be base64 encoded
            binaryData = Uint8Array.from(atob(exportContent), c => c.charCodeAt(0));
        }

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/reports/${storagePath}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/reports/${storagePath}`;

        // Update template usage count
        await fetch(`${supabaseUrl}/rest/v1/export_templates?id=eq.${templateId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usage_count: template.usage_count + 1
            })
        });

        // Return success response
        const result = {
            success: true,
            export_url: publicUrl,
            file_name: fileName,
            file_size: binaryData.length,
            format: exportFormat,
            template_name: template.template_name,
            generated_at: new Date().toISOString(),
            record_count: Object.values(exportData).reduce((total: number, data: any) => total + (data.length || 0), 0)
        };

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Export generation error:', error);

        const errorResponse = {
            error: {
                code: 'EXPORT_GENERATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to generate CSV content
function generateCSV(data: any, config: any): string {
    const csvRows = [];
    
    // Add header with report info
    csvRows.push(`Report Generated: ${new Date().toISOString()}`);
    csvRows.push('');
    
    // Process each data source
    for (const [tableName, tableData] of Object.entries(data)) {
        if (!Array.isArray(tableData) || tableData.length === 0) continue;
        
        csvRows.push(`=== ${tableName.toUpperCase()} ===`);
        
        // Add headers
        const headers = Object.keys(tableData[0]);
        csvRows.push(headers.join(','));
        
        // Add data rows
        for (const row of tableData) {
            const values = headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in CSV
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            });
            csvRows.push(values.join(','));
        }
        
        csvRows.push('');
    }
    
    return csvRows.join('\n');
}

// Helper function to generate Excel data (base64 encoded)
function generateExcelData(data: any, config: any): string {
    // For demo purposes, convert to CSV and encode as base64
    // In production, use a proper Excel library
    const csvContent = generateCSV(data, config);
    return btoa(csvContent);
}

// Helper function to generate PDF data (base64 encoded)
function generatePDFData(data: any, config: any): string {
    // For demo purposes, create simple text-based PDF content
    // In production, use a proper PDF library
    const textContent = `
Instagram Analytics Export Report
Generated: ${new Date().toISOString()}

${Object.entries(data).map(([tableName, tableData]) => `
${tableName.toUpperCase()}
${Array.isArray(tableData) ? `Records: ${tableData.length}` : 'No data available'}
`).join('\n')}
    `;
    
    return btoa(textContent);
}