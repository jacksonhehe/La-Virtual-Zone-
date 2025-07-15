import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { CalendarEvent } from '@/components/calendar/EventModal'

const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('date')
      .then(({ data, error }) => {
        if (!error && data) {
          setEvents(data as CalendarEvent[])
        }
      })
  }, [])

  return events
}

export default useCalendarEvents
