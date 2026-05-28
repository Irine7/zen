import type { Request, Response } from "express";
import type { createLoaders } from "@/lib/dataloaders";

export interface Context {
	userId?: string;
	req: Request;
	res: Response;
	loaders: ReturnType<typeof createLoaders>;
}