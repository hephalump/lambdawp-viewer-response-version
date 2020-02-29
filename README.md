# lambdawp-viewer-response-version

[![Serverless][ico-serverless]][link-serverless]
[![License][ico-license]][link-license] [![NPM][ico-npm]][link-npm]
[![Build Status][ico-build]][link-build]
[![Contributors][ico-contributors]][link-contributors]

A Serverless v1.x plugin to auto update lambda function version for
[Lambda@Edge][link-lambda-edge] LambdaFunctionAssociations.

Amazon recently added a requirement to LambdaFunctionAssociations, where you can
no longer reference the `arn`+`alias`(or `$LATEST`) and are now required to
provide `arn`+`version`. This plugin handles appending on the version for you.
You just need to set your `LambdaFunctionARN`s equal to the
[logicalID][link-sls-resref] string and the plugin will take care of the rest.

## Install

```bash
$ npm install lambdawp-viewer-response-version --save-dev
```

Add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - lambdawp-viewer-response-version
```

## Usage

Set your yml references `LambdaFunctionAssociations[n].LambdaFunctionARN` equal
to the [logicalID][link-sls-resref] of your function.

```yaml
functions:
  myfunction:
    handler: functions/myfunction/handler.myfunctionHandler

resources:
  Resources:
  CDN:
    Type: "AWS::CloudFront::Distribution"
    Properties:
      DistributionConfig:
        ...
        DefaultCacheBehavior:
          ...
          LambdaFunctionAssociations:
            - EventType: origin-request
              LambdaFunctionARN: MyfunctionLambdaFunction
```

> :exclamation: Any `LambdaFunctionARN`s already set to `arn`+`version` should
> be ignored by the plugin.

Cloudformation Output:

```json
"LambdaFunctionAssociations": [
  {
    "EventType": "origin-request",
    "LambdaFunctionARN": {
      "Fn::Join": [
        "",
        [
          {
            "Fn::GetAtt": [
              "MyfunctionLambdaFunction",
              "Arn"
            ]
          },
          ":",
          {
            "Fn::GetAtt": [
              "MyfunctionLambdaFunctionOZWEIGtTFB4RTIGbHCEthNMa97ZkMRinlERrCc0",
              "Version"
            ]
          }
        ]
      ]
    }
  }
],
```

[ico-build]: https://travis-ci.org/hephalump/lambdawp-viewer-response-version.svg?branch=master
[ico-license]: https://img.shields.io/github/license/hephalump/lambdawp-viewer-response-version.svg
[ico-npm]: https://img.shields.io/npm/v/lambdawp-viewer-response-version.svg
[ico-contributors]: https://img.shields.io/github/contributors/hephalump/lambdawp-viewer-response-version.svg
[ico-serverless]: http://public.serverless.com/badges/v3.svg
[link-license]: ./blob/master/LICENSE
[link-serverless]: http://www.serverless.com/
[link-npm]: https://www.npmjs.com/package/hephalump/lambdawp-viewer-response-version
[link-build]: https://travis-ci.org/hephalump/lambdawp-viewer-response-version
[link-contributors]: https://github.com/hephalump/lambdawp-viewer-response-version/graphs/contributors
[link-lambda-edge]: http://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html
[link-sls-resref]: https://serverless.com/framework/docs/providers/aws/guide/resources/#aws-cloudformation-resource-reference
