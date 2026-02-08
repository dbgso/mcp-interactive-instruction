# Architecture

Guidelines for service layer architecture and code organization.

## Service Layer

Aggregate business logic in service classes.

```
src/
  services/
    UserService.ts      # Logic aggregation
    UserService.test.ts # Unit tests required
  handlers/
    userHandler.ts      # Only calls services
```

Handlers should be thin wrappers that delegate to services.