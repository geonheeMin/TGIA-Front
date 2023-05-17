export type Post = {
  category: string;
  createdDate: string;
  date: string | undefined;
  department: string;
  images: Array<string>;
  item_name: string;
  member_id: number;
  post_id: number;
  likes: number;
  locationType: string;
  location_text: string;
  price: number;
  purchased: number | undefined;
  text: string;
  track: string;
  views: number;
  title: string;
  writer: string | undefined;
  statusType: string;
};
