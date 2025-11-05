# Instagram Looter API Documentation Report

## API Overview

**API Name:** Instagram Looter  
**Provider:** IRROR Systems  
**URL:** https://rapidapi.com/irrors-apis/api/instagram-looter2  
**Category:** Social  
**Popularity:** 9.9/10  
**Service Level:** 99%  
**Latency:** 3523ms  
**Test Success Rate:** 93%  

### Key Features
- Real-time access to public Instagram data
- 99.99% success guarantee through intelligent request filtering
- Independent service (not affiliated with Meta/Instagram)
- Data sourced exclusively from publicly available sources
- Custom packages available for high-volume requests

## Available Endpoints

The API provides **20 endpoints** across **6 main categories**:

### 🧩 Identity Utilities (4 endpoints)

1. **GET Username from user ID**
   - **Purpose:** Retrieves the Instagram username associated with a given user ID
   - **Endpoint Path:** `/username-from-id`
   - **Example Request:**
     ```bash
     curl --request GET \
       --url 'https://instagram-looter2.p.rapidapi.com/username-from-id?user_id=123456' \
       --header 'x-rapidapi-host: instagram-looter2.p.rapidapi.com'
     ```

2. **GET User ID from username**
   - **Purpose:** Retrieves the Instagram user ID associated with a given username
   - **Endpoint Path:** `/user-id-from-username`
   - **Example Request:**
     ```bash
     curl --request GET \
       --url 'https://instagram-looter2.p.rapidapi.com/user-id-from-username?username=instagram' \
       --header 'x-rapidapi-host: instagram-looter2.p.rapidapi.com'
     ```

3. **GET Media shortcode from media ID**
   - **Purpose:** Retrieves the media shortcode from a provided media ID
   - **Endpoint Path:** `/media-shortcode-from-id`

4. **GET Media ID from media URL**
   - **Purpose:** Retrieves the media ID from a given Instagram media URL
   - **Endpoint Path:** `/media-id-from-url`

### 👤 User Insights (11 endpoints)

1. **GET User info by username**
   - **Purpose:** Fetches general user information using their Instagram username
   - **Endpoint Path:** `/user-info`

2. **GET User info (V2) by username**
   - **Purpose:** Fetches version 2 (V2) of user information using their Instagram username
   - **Endpoint Path:** `/user-info-v2`

3. **GET User info by user ID**
   - **Purpose:** Fetches general user information using their Instagram user ID
   - **Endpoint Path:** `/user-info-by-id`

4. **GET User info (V2) by user ID**
   - **Purpose:** Fetches version 2 (V2) of user information using their Instagram user ID
   - **Endpoint Path:** `/user-info-v2-by-id`

5. **GET Web profile info by username**
   - **Purpose:** Retrieves web-specific profile information for a given username
   - **Endpoint Path:** `/web-profile-info`

6. **GET Media list by user ID**
   - **Purpose:** Retrieves a list of media posted by a specified user ID
   - **Endpoint Path:** `/media-list`

7. **GET Media list (V2) by user ID**
   - **Purpose:** Retrieves a version 2 (V2) list of media posted by a specified user ID
   - **Endpoint Path:** `/media-list-v2`

8. **GET Reels by user ID**
   - **Purpose:** Fetches Instagram Reels associated with a specified user ID
   - **Endpoint Path:** `/reels`

9. **GET Reposts by user ID**
   - **Purpose:** Retrieves a list of reposts made by a specified user ID
   - **Endpoint Path:** `/reposts`

10. **GET Tagged media by user ID**
    - **Purpose:** Retrieves media where a specified user ID has been tagged
    - **Endpoint Path:** `/tagged-media`

11. **GET Related profiles by user ID**
    - **Purpose:** Fetches Instagram profiles related to a specified user ID
    - **Endpoint Path:** `/related-profiles`

12. **GET Search users by keyword**
    - **Purpose:** Searches for Instagram users using a specific keyword
    - **Endpoint Path:** `/search`
    - **Detailed Documentation:**
      - **Method:** GET
      - **Required Parameters:**
        - `query` (String): The keyword or phrase to use for searching users
        - `select` (String): Specifies the type of entity to search for (typically 'users')
      - **Required Headers:**
        - `x-rapidapi-host`: instagram-looter2.p.rapidapi.com
      - **Example Request:**
        ```bash
        curl --request GET \
          --url 'https://instagram-looter2.p.rapidapi.com/search?query=javan&select=users' \
          --header 'x-rapidapi-host: instagram-looter2.p.rapidapi.com'
        ```

### 📸 Media Details (4 endpoints)

1. **GET Media info by URL**
   - **Purpose:** Retrieves detailed information about Instagram media using its URL
   - **Endpoint Path:** `/media-info-by-url`

2. **GET Media info by ID**
   - **Purpose:** Retrieves detailed information about Instagram media using its ID
   - **Endpoint Path:** `/media-info-by-id`

3. **GET Download link by media ID or URL**
   - **Purpose:** Provides a direct download link for media, identified by its ID or URL
   - **Endpoint Path:** `/download-link`

4. **GET Music info by music ID**
   - **Purpose:** Retrieves information about music used in Instagram media, identified by its music ID
   - **Endpoint Path:** `/music-info`

### Additional Categories (Available but not fully expanded)

- **🔖 Hashtag Lookup**
- **🗺️ Location Data**
- **🔍 Explore Feed**
- **🌐 Global Search**

## API Requirements

### Headers
All requests require:
- `x-rapidapi-host`: instagram-looter2.p.rapidapi.com
- `x-rapidapi-key`: (Your RapidAPI subscription key)

### Authentication
- No additional authorization beyond standard RapidAPI subscription and API key
- The API key is typically handled automatically by the RapidAPI platform

## Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| **BASIC** | $0.00/mo | Free tier with limited requests |
| **PRO** | $9.90/mo | Enhanced limits and features |
| **ULTRA** | $27.90/mo | Higher rate limits |
| **MEGA** | $75.90/mo | Maximum limits + priority support |

## Contact Information

- **Telegram:** https://t.me/IrrorSystems
- **Email:** Irrors@proton.me
- **Provider Profile:** https://rapidapi.com/organization/irrors

## Important Notes

1. **Data Source:** All data is collected from publicly available Instagram sources only
2. **Independence:** This service is not affiliated with Meta, Instagram, or their subsidiaries
3. **Success Rate:** Claims 99.99% success rate through intelligent request filtering
4. **Custom Packages:** Available for high-volume requests with increased rate limits and priority support
5. **Rate Limits:** Vary by subscription plan
6. **External Factors:** Service acknowledges that Instagram server health and proxy performance may affect extraction reliability

## Screenshots

Screenshots of the API endpoints overview have been captured and saved:
- `instagram_looter_endpoints_overview.png`: Initial page view
- `instagram_looter_expanded_endpoints.png`: Expanded endpoints view

---

*Report generated on 2025-11-01 04:33:14*