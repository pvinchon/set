# Contracts: Hello World Website with CI/CD

This feature has **no API contracts**. It is a static site with no server-side runtime, no REST/GraphQL endpoints, and no external service integrations.

The only "contract" is the build output structure:

```
_site/
├── index.html    # Well-formed HTML containing "Hello, World!"
└── style.css     # Purged + minified Tailwind CSS
```

This contract is validated by `tests/build_test.ts`.
