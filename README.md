# codeship-slack-filter

Filter out unwanted Codeship build notifications before sending to Slack.

## Getting Started

1. Clone the repository.
2. Install the dependencies.

        $ npm install

3. Export your environment variables, e.g.:

        $ export HOOK_ROUTE=39624f1b3d4a1775cb10bacd83b028908a13f8f8
        $ export SLACK_CODESHIP_WEBHOOK_URL=https://hooks.slack.com/services/000000000/111111111/222222222233333333334444

4. Run the server

        $ npm run build && npm start


## Contributing

Read the [instructions for contributing](./CONTRIBUTING.md).

1. Clone the repository.

2. Run the setup tasks:

        $ npm install
        $ npm test


## License

See the [LICENSE](./LICENSE) file.


[minimist]: https://github.com/substack/minimist
[cliclopts]: https://github.com/finnp/cliclopts
