Rate Limits
Copy page

Rate limits act as control measures to regulate how frequently users and applications can access our API within specified timeframes. These limits help ensure service stability, fair access, and protection against misuse so that we can serve reliable and fast inference for all.

Understanding Rate Limits
Rate limits are measured in:

RPM: Requests per minute
RPD: Requests per day
TPM: Tokens per minute
TPD: Tokens per day
ASH: Audio seconds per hour
ASD: Audio seconds per day
Cached tokens do not count towards your rate limits.

Rate limits apply at the organization level, not individual users. You can hit any limit type depending on which threshold you reach first.

Example: Let's say your RPM = 50 and your TPM = 200K. If you were to send 50 requests with only 100 tokens within a minute, you would reach your limit even though you did not send 200K tokens within those 50 requests.

Rate Limits
The following is a high level summary and there may be exceptions to these limits. You can view the current, exact rate limits for your organization on the limits page in your account settings.

Need higher rate limits? Upgrade to Developer plan to access higher limits, Batch and Flex processing, and more. Note that the limits shown below are the base limits for the Developer plan, and higher limits are available for select workloads and enterprise use cases.

Free Plan Limits
Developer Plan Limits
MODEL ID	RPM	RPD	TPM	TPD	ASH	ASD
allam-2-7b
30
7K
6K
500K
-
-
canopylabs/orpheus-arabic-saudi
10
100
1.2K
3.6K
-
-
canopylabs/orpheus-v1-english
10
100
1.2K
3.6K
-
-
groq/compound
30
250
70K
-
-
-
groq/compound-mini
30
250
70K
-
-
-
llama-3.1-8b-instant
30
14.4K
6K
500K
-
-
llama-3.3-70b-versatile
30
1K
12K
100K
-
-
meta-llama/llama-4-maverick-17b-128e-instruct
30
1K
6K
500K
-
-
meta-llama/llama-4-scout-17b-16e-instruct
30
1K
30K
500K
-
-
meta-llama/llama-guard-4-12b
30
14.4K
15K
500K
-
-
meta-llama/llama-prompt-guard-2-22m
30
14.4K
15K
500K
-
-
meta-llama/llama-prompt-guard-2-86m
30
14.4K
15K
500K
-
-
moonshotai/kimi-k2-instruct
60
1K
10K
300K
-
-
moonshotai/kimi-k2-instruct-0905
60
1K
10K
300K
-
-
openai/gpt-oss-120b
30
1K
8K
200K
-
-
openai/gpt-oss-20b
30
1K
8K
200K
-
-
openai/gpt-oss-safeguard-20b
30
1K
8K
200K
-
-
playai-tts
10
100
1.2K
3.6K
-
-
playai-tts-arabic
10
100
1.2K
3.6K
-
-
qwen/qwen3-32b
60
1K
6K
500K
-
-
whisper-large-v3
20
2K
-
-
7.2K
28.8K
whisper-large-v3-turbo
20
2K
-
-
7.2K
28.8K
Rate Limit Headers
In addition to viewing your limits on your account's limits page, you can also view rate limit information such as remaining requests and tokens in HTTP response headers as follows:

The following headers are set (values are illustrative):

Header	Value	Notes
retry-after	2	In seconds
x-ratelimit-limit-requests	14400	Always refers to Requests Per Day (RPD)
x-ratelimit-limit-tokens	18000	Always refers to Tokens Per Minute (TPM)
x-ratelimit-remaining-requests	14370	Always refers to Requests Per Day (RPD)
x-ratelimit-remaining-tokens	17997	Always refers to Tokens Per Minute (TPM)
x-ratelimit-reset-requests	2m59.56s	Always refers to Requests Per Day (RPD)
x-ratelimit-reset-tokens	7.66s	Always refers to Tokens Per Minute (TPM)
Handling Rate Limits
When you exceed rate limits, our API returns a 429 Too Many Requests HTTP status code.

Note: retry-after is only set if you hit the rate limit and status code 429 is returned. The other headers are always included.
Quickstart
Copy page

Get up and running with the Groq API in a few minutes, with the steps below.

For additional support, catch our onboarding video.

Create an API Key
Please visit here to create an API Key.

Set up your API Key (recommended)
Configure your API key as an environment variable. This approach streamlines your API usage by eliminating the need to include your API key in each request. Moreover, it enhances security by minimizing the risk of inadvertently including your API key in your codebase.

In your terminal of choice:
shell

export GROQ_API_KEY=<your-api-key-here>
Requesting your first chat completion
curl
JavaScript
Python
JSON
Install the Groq Python library:
shell

pip install groq
Performing a Chat Completion:
Python

import os

from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],
    model="llama-3.3-70b-versatile",
)

print(chat_completion.choices[0].message.content)
Using third-party libraries and SDKs
Vercel AI SDK
LiteLLM
LangChain
Using AI SDK:
AI SDK is a Javascript-based open-source library that simplifies building large language model (LLM) applications. Documentation for how to use Groq on the AI SDK can be found here.


First, install the ai package and the Groq provider @ai-sdk/groq:


shell

pnpm add ai @ai-sdk/groq

Then, you can use the Groq provider to generate text. By default, the provider will look for GROQ_API_KEY as the API key.


JavaScript

import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

const { text } = await generateText({
  model: groq('llama-3.3-70b-versatile'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
Now that you have successfully received a chat completion, you can try out the other endpoints in the API.

Next Steps
Check out the Playground to try out the Groq API in your browser
Join our GroqCloud developer community
Add a how-to on your project to the Groq API Cookbook