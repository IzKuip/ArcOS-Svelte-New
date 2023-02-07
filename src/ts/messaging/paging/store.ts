import { writable } from "svelte/store";
import Unread from "../../../lib/Apps/MessagingApp/Pages/Unread.svelte";
import {
  getReceivedMessages,
  getSentMessages,
  getUnreadMessages,
} from "../get";
import { getMessages, selectedMessageId } from "../main";
import { messageUpdateTrigger } from "../updates";
import type { MessagingPage, MsgPages } from "./interface";

export const messagingPage = writable<MessagingPage>(null);

messagingPage.subscribe(() => {
  setTimeout(messageUpdateTrigger, 100);
});

selectedMessageId.subscribe(messageUpdateTrigger);

export const MessagingPages: MsgPages = {
  unread: {
    name: "Unread",
    icon: "mark_email_unread",
    msgGetter: getUnreadMessages,
  },
  inbox: {
    name: "Inbox",
    icon: "inbox",
    msgGetter: getReceivedMessages,
  },
  sent: {
    name: "Sent",
    icon: "send",
    msgGetter: getSentMessages,
  },
};