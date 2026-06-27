// Church departments / ministries a member can serve in.
// Source: provided "church sections" document. Shown after a user joins/creates
// a church so they can pick where they serve. Stored in profiles.ministry_role.

export const OTHER_ROLE = "Others (specify)";

// All selectable departments / ministries (kept unsorted here for easy editing).
const ROLES = [
  "Member",
  "Pastor",
  "Associate Pastor",
  "Prayer Coordinator / Intercessor",
  "Worship Leader",
  "Choir Master / Mistress",
  "Choir Member",
  "Music Director",
  "Usher",
  "Protocol Officer",
  "Hospitality Officer",
  "Altar Minister",
  "Sunday School Teacher",
  "Bible Study Teacher",
  "Discipleship Leader",
  "Children's Church Teacher",
  "Youth Leader",
  "Men's Fellowship Leader",
  "Women's Fellowship Leader",
  "Marriage Counselor",
  "Evangelist",
  "Mission Coordinator",
  "Community Outreach Officer",
  "Visitor / Follow-up Officer",
  "Church Counselor",
  "Church Administrator",
  "Secretary",
  "Treasurer / Finance Officer",
  "Accountant",
  "Human Resources Officer",
  "Volunteer Coordinator",
  "Media Personnel",
  "Graphic Designer",
  "Photographer",
  "Videographer",
  "Sound Engineer",
  "IT Officer",
  "Security Officer",
  "Driver / Transport Officer",
  "Maintenance Officer",
  "Cleaner / Facility Officer",
  "Event Decorator",
  "Welfare Officer",
  "Deacon / Deaconess",
  "Elder",
];

// Shown in the dropdown: departments A→Z, with "Others (specify)" always last.
export const CHURCH_ROLES: string[] = [
  ...ROLES.sort((a, b) => a.localeCompare(b)),
  OTHER_ROLE,
];
