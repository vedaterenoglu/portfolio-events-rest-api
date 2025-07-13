// Mock for NestJS testing utilities
export const createMockRequest = () => ({
  headers: {},
  body: {},
  query: {},
  params: {},
  user: undefined,
  ip: '127.0.0.1',
  url: '/',
  method: 'GET'
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockExecutionContext = (request = createMockRequest()) => ({
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue(request),
    getResponse: jest.fn().mockReturnValue(createMockResponse())
  }),
  getHandler: jest.fn(),
  getClass: jest.fn()
});