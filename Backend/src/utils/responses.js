export function sendSuccess(res, data = {}, message) {
  return res.json({ success: true, data, ...(message ? { message } : {}) });
}

export function sendError(res, status, message, details) {
  return res.status(status).json({ success: false, data: {}, message, ...(details ? { details } : {}) });
}
