
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeFieldsGroupProps {
  startTime: string;
  endTime: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startTimeError?: string;
  endTimeError?: string;
  required?: boolean;
}

const TimeFieldsGroup: React.FC<TimeFieldsGroupProps> = ({
  startTime,
  endTime,
  onChange,
  startTimeError,
  endTimeError,
  required = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="startTime" className={required ? "required" : ""}>Start Time (HH:MM)</Label>
        <Input
          id="startTime"
          name="startTime"
          value={startTime}
          onChange={onChange}
          placeholder="e.g. 14:30"
          className={startTimeError ? "border-destructive" : ""}
          required={required}
        />
        {startTimeError && <p className="text-sm text-destructive">{startTimeError}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endTime" className={required ? "required" : ""}>End Time (HH:MM)</Label>
        <Input
          id="endTime"
          name="endTime"
          value={endTime}
          onChange={onChange}
          placeholder="e.g. 16:00"
          className={endTimeError ? "border-destructive" : ""}
          required={required}
        />
        {endTimeError && <p className="text-sm text-destructive">{endTimeError}</p>}
      </div>
    </div>
  );
};

export default TimeFieldsGroup;
