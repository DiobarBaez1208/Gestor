export interface EndpointSchema<
    TParams extends Record<string, unknown> = Record<string, unknown>,
    TBody = unknown,
    TQuery extends Record<string, unknown> = Record<string, unknown>,
    TResponse = unknown,
> {
    params: TParams;
    body: TBody;
    query: TQuery;
    response: TResponse;
}