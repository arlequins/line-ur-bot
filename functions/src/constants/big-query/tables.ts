export const masterHouses = [
  {
    name: "identifier",
    type: "DATE",
    mode: "REQUIRED",
  },
  { name: "user_id", type: "INTEGER", mode: "REQUIRED" },
  { name: "line_user_id", type: "STRING", mode: "NULLABLE" },
  { name: "nearme_user_id", type: "STRING", mode: "NULLABLE" },
  { name: "stripe_customer_id", type: "STRING", mode: "NULLABLE" },
  { name: "mico_user_id", type: "INTEGER", mode: "NULLABLE" },
  { name: "default_payment_method_type", type: "INTEGER", mode: "NULLABLE" },
  { name: "saved_payment_method_id", type: "STRING", mode: "NULLABLE" },

  { name: "user_created_at", type: "DATETIME", mode: "NULLABLE" },
  { name: "line_user_created_at", type: "DATETIME", mode: "NULLABLE" },
  { name: "nearme_user_created_at", type: "DATETIME", mode: "NULLABLE" },
  { name: "stripe_customer_created_at", type: "DATETIME", mode: "NULLABLE" },
  { name: "mico_user_last_created_at", type: "DATETIME", mode: "NULLABLE" },

  // timestamp
  {
    name: "sync_timestamp",
    type: "INTEGER",
  },
];

export const masterRooms = [
  {
    name: "identifier",
    type: "DATE",
    mode: "REQUIRED",
  },
  { name: "user_id", type: "INTEGER", mode: "REQUIRED" },
  { name: "line_user_id", type: "STRING", mode: "NULLABLE" },
  { name: "nearme_user_id", type: "STRING", mode: "NULLABLE" },
  { name: "stripe_customer_id", type: "STRING", mode: "NULLABLE" },
  { name: "mico_user_id", type: "INTEGER", mode: "NULLABLE" },
  { name: "default_payment_method_type", type: "INTEGER", mode: "NULLABLE" },
  { name: "saved_payment_method_id", type: "STRING", mode: "NULLABLE" },

  { name: "user_created_at", type: "DATETIME", mode: "NULLABLE" },
  { name: "line_user_created_at", type: "DATETIME", mode: "NULLABLE" },
  { name: "nearme_user_created_at", type: "DATETIME", mode: "NULLABLE" },
  { name: "stripe_customer_created_at", type: "DATETIME", mode: "NULLABLE" },
  { name: "mico_user_last_created_at", type: "DATETIME", mode: "NULLABLE" },

  // timestamp
  {
    name: "sync_timestamp",
    type: "INTEGER",
  },
];

export const roomRecords = [
  {
    name: "identifier",
    type: "DATE",
    mode: "REQUIRED",
  },
  { name: "user_id", type: "INTEGER", mode: "REQUIRED" },

  { name: "tag_id", type: "INTEGER", mode: "NULLABLE" },
  { name: "tag_name", type: "STRING", mode: "NULLABLE" },
  { name: "tag_folder_id", type: "INTEGER", mode: "NULLABLE" },
  { name: "tag_folder_name", type: "STRING", mode: "NULLABLE" },

  // timestamp
  {
    name: "sync_timestamp",
    type: "INTEGER",
  },
];
