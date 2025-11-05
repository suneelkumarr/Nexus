import { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Event, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { Calendar, Plus, X, Save, Trash2, Clock } from 'lucide-react';

const localizer = momentLocalizer(moment);

interface ContentCalendarProps {
  accountId: string;
}

interface ContentEvent extends Event {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  status?: string;
  caption?: string;
  content_type?: string;
}

interface ContentForm {
  title: string;
  caption: string;
  content_type: string;
  scheduled_date: string;
  status: string;
}

export default function ContentCalendar({ accountId }: ContentCalendarProps) {
  const [events, setEvents] = useState<ContentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ContentEvent | null>(null);
  const [formData, setFormData] = useState<ContentForm>({
    title: '',
    caption: '',
    content_type: 'post',
    scheduled_date: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchContentEvents();
  }, [accountId]);

  const fetchContentEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_management')
        .select('*')
        .eq('account_id', accountId)
        .not('scheduled_date', 'is', null);

      if (error) throw error;

      const calendarEvents: ContentEvent[] = (data || []).map(item => ({
        id: item.id,
        title: item.title || 'Untitled Post',
        start: new Date(item.scheduled_date),
        end: new Date(new Date(item.scheduled_date).getTime() + 60 * 60 * 1000), // 1 hour duration
        status: item.status,
        caption: item.caption,
        content_type: item.content_type
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      caption: '',
      content_type: 'post',
      scheduled_date: moment(slotInfo.start).format('YYYY-MM-DDTHH:mm'),
      status: 'scheduled'
    });
    setShowModal(true);
  }, []);

  const handleSelectEvent = useCallback((event: ContentEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      caption: event.caption || '',
      content_type: event.content_type || 'post',
      scheduled_date: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      status: event.status || 'scheduled'
    });
    setShowModal(true);
  }, []);

  const handleSaveEvent = async () => {
    try {
      if (!formData.title || !formData.scheduled_date) {
        alert('Please fill in all required fields');
        return;
      }

      if (selectedEvent?.id) {
        // Update existing event
        const { error } = await supabase
          .from('content_management')
          .update({
            title: formData.title,
            caption: formData.caption,
            content_type: formData.content_type,
            scheduled_date: formData.scheduled_date,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedEvent.id);

        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase
          .from('content_management')
          .insert({
            account_id: accountId,
            title: formData.title,
            caption: formData.caption,
            content_type: formData.content_type,
            scheduled_date: formData.scheduled_date,
            status: formData.status
          });

        if (error) throw error;
      }

      setShowModal(false);
      fetchContentEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;

    if (!confirm('Are you sure you want to delete this scheduled content?')) return;

    try {
      const { error } = await supabase
        .from('content_management')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) throw error;

      setShowModal(false);
      fetchContentEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const eventStyleGetter = (event: ContentEvent) => {
    const statusColors: Record<string, any> = {
      scheduled: { backgroundColor: '#8b5cf6', color: 'white' },
      draft: { backgroundColor: '#3b82f6', color: 'white' },
      published: { backgroundColor: '#10b981', color: 'white' },
      pending_approval: { backgroundColor: '#f59e0b', color: 'white' }
    };

    return {
      style: statusColors[event.status || 'scheduled'] || statusColors.scheduled
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Calendar</h2>
            <p className="text-gray-600 dark:text-gray-400">Schedule and organize your Instagram posts</p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setFormData({
              title: '',
              caption: '',
              content_type: 'post',
              scheduled_date: moment().format('YYYY-MM-DDTHH:mm'),
              status: 'scheduled'
            });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Add Content</span>
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div style={{ height: '700px' }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="month"
            style={{ height: '100%' }}
          />
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedEvent ? 'Edit Content' : 'Schedule New Content'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Caption
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter post caption"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Type
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="post">Post</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                    <option value="carousel">Carousel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                {selectedEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-purple-600"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Scheduled</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Draft</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-orange-600"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Pending Approval</span>
          </div>
        </div>
      </div>
    </div>
  );
}
