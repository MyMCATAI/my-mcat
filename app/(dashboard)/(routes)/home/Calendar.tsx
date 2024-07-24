"use client";
import React from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
// Initialize localizer
const localizer = momentLocalizer(moment);

// Define sample events or import them from elsewhere
const myEventsList = [
  {
    title: "Sample Event",
    start: new Date(),
    end: new Date(moment().add(1, "hours").toDate()),
  },
];

const MyCalendar = () => {
  return (
    <div style={{ height: 280,background:"white" }}>
      <BigCalendar
        localizer={localizer}
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
};

export default MyCalendar;
