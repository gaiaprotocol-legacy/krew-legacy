import { Post } from "@common-module/social";

export enum PostTarget {
  EVERYONE,
  KEY_HOLDERS,
}

export default interface KrewPost extends Post {
  target: PostTarget;
  krew?: string;
}
