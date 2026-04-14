import { Request, Response } from 'express';
import type { MetricCreateInput, MetricListQueryInput, MetricTrendParamsInput } from '@ifly-medical/shared';
import { getRequestUser } from '../types/request-user';
import * as metricService from '../services/metric.service';
import { getValidated } from '../middleware/validate';

export async function getMetrics(req: Request, res: Response) {
  const { page, limit, type } = getValidated<MetricListQueryInput>(res, 'query');
  const metrics = await metricService.getMetrics(getRequestUser(req).userId, page, limit, type);
  res.json(metrics);
}

export async function getMetricTrend(req: Request, res: Response) {
  const { type } = getValidated<MetricTrendParamsInput>(res, 'params');
  const trend = await metricService.getMetricTrend(getRequestUser(req).userId, type);
  res.json(trend);
}

export async function getMetric(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');
  const metric = await metricService.getMetric(getRequestUser(req).userId, id);
  res.json(metric);
}

export async function createMetric(req: Request, res: Response) {
  const body = req.body as MetricCreateInput;
  const metric = await metricService.createMetric(getRequestUser(req).userId, {
    ...body,
    recordedAt: new Date(body.recordedAt),
  });
  res.status(201).json(metric);
}

export async function deleteMetric(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');
  await metricService.deleteMetric(getRequestUser(req).userId, id);
  res.json({ success: true });
}
