import { Post } from "sofi-module";

export enum PostTarget {
  EVERYONE,
  KEY_HOLDERS,
}

export default interface KrewPost extends Post {
  target: PostTarget;
  krew?: string;
}
