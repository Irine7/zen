import type { Request, Response } from "express";

export interface Context {
	userId?: string;
	req: Request;
	res: Response;
}