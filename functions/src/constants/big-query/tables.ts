export const masterHouses = [
  {name: "identifier", type: "DATE", mode: "REQUIRED"},

  {name: "house_id", type: "STRING", mode: "REQUIRED"},

  // timestamp
  {name: "sync_timestamp", type: "STRING"},
];

export const masterRooms = [
  {name: "identifier", type: "DATE", mode: "REQUIRED"},

  {name: "house_id", type: "STRING", mode: "REQUIRED"},
  {name: "room_id", type: "STRING", mode: "REQUIRED"},

  // timestamp
  {name: "sync_timestamp", type: "STRING"},
];

export const roomRecords = [
  {name: "identifier", type: "DATE", mode: "REQUIRED"},

  {name: "house_id", type: "STRING", mode: "REQUIRED"},
  {name: "room_id", type: "STRING", mode: "REQUIRED"},

  {name: "pref", type: "STRING", mode: "NULLABLE"},
  {name: "area", type: "STRING", mode: "NULLABLE"},
  {name: "house_name", type: "STRING", mode: "NULLABLE"},
  {name: "skcs", type: "STRING", mode: "NULLABLE"},
  {name: "room_name", type: "STRING", mode: "NULLABLE"},
  {name: "type", type: "STRING", mode: "NULLABLE"},
  {name: "floorspace", type: "STRING", mode: "NULLABLE"},
  {name: "floor", type: "STRING", mode: "NULLABLE"},
  {name: "timestamp", type: "STRING", mode: "NULLABLE"},
  {
    "name": "updated",
    "type": "RECORD",
    "mode": "REPEATED",
    "fields": [
      {
        "name": "timestamp",
        "type": "STRING",
        "mode": "NULLABLE",
      },
    ],
  },

  {name: "low_rent", type: "INTEGER", mode: "NULLABLE"},
  {name: "high_rent", type: "INTEGER", mode: "NULLABLE"},

  {name: "commonfee", type: "INTEGER", mode: "NULLABLE"},

  // timestamp
  {name: "sync_timestamp", type: "STRING"},
];
