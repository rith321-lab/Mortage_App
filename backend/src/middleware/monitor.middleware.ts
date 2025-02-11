import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

export const monitorRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  
  // Add response tracking
  const oldSend = res.send;
  res.send = function(data) {
    const duration = performance.now() - start;
    
    // Log request details
    console.log({
      path: req.path,
      method: req.method,
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    return oldSend.apply(res, arguments);
  };
  
  next();
}; 