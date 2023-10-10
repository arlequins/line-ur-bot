interface ProtoTableType {
  identifier: string;
  sync_timestamp: number;
}

export interface TableMasterHouses extends ProtoTableType {
  user_id: number;
  line_user_id: string;
  nearme_user_id: string;
  stripe_customer_id: string;
  mico_user_id: number;
  default_payment_method_type: number;
  saved_payment_method_id: string;
  user_created_at: string;
  line_user_created_at: string;
  nearme_user_created_at: string;
  stripe_customer_created_at: string;
  mico_user_last_created_at: string;
}

export interface TableMasterRooms extends ProtoTableType {
  user_id: number;
  mico_user_id: number;
  mico_created_at: string;
  mico_updated_at: string;
  blocking: boolean;
}

export interface TableRoomRecords extends ProtoTableType {
  user_id: number;
  profile_key: string;
  profile_value: string;
}
