import { IncomingMessage, ServerResponse } from "http";

export interface Context {
	userId?: string;
	req?: IncomingMessage;
	res?: ServerResponse;
}