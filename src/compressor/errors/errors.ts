import { Response } from 'express';

export const serverError = (res: Response): Response => {
  return res
    .status(500)
    .json({ errors: [{ code: 500, message: 'Internal Server Error' }] });
};

export const ok = (res: Response, data: any): Response => {
  if (Array.isArray(data)) {
    return res.status(200).json({ body: { count: data.length, data } });
  }

  return res.status(200).json({ body: data });
};

export const unaceptedUrl = (res: Response): Response => {
  return res.status(403).json({
    errors: [{ code: 403, message: 'Unacepted URL, please use an https URL' }],
  });
};
