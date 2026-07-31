---
name: link-reader
description: Fetch tweets, Twitter/X articles, and Reddit posts via proxy APIs. Use when the user provides a twitter.com, x.com, or reddit.com URL, or asks to read a tweet, post, article, or thread from Twitter/X or Reddit.
---

# Link Reader

Read content from URLs that block direct web fetching by routing through proxy APIs.

## Supported Platforms

### Twitter / X

**URL patterns**: `twitter.com/*/status/*`, `x.com/*/status/*`, `twitter.com/*/article/*`, `x.com/*/article/*`

**Proxy**: FxTwitter API (`api.fxtwitter.com`)

**Steps**:

1. Extract the path after the domain (e.g., `/trq212/status/1234567890`)
2. Fetch `https://api.fxtwitter.com{path}` using WebFetch
3. Parse the JSON response
4. Format based on content type (see below)

#### Regular Tweets

The response JSON has shape: `{ tweet: { text, author, likes, retweets, ... } }`

Format as:

```
**@{author.screen_name}** ({author.name})

{tweet.text}

{if media.photos: list image URLs}
{if media.videos: list video thumbnail URLs}
{if quote: show quoted tweet inline, indented}

Likes: {likes} · Retweets: {retweets} · Views: {views}
{created_at}
```

#### Twitter/X Articles

When `tweet.article` is present, the tweet is an article (long-form post). The article content uses Draft.js block format.

The `article` object contains:

- `title` — article title
- `cover_image` — hero image metadata (use `original_img_url`)
- `content.blocks[]` — array of content blocks
- `content.entityMap` — links and media referenced by blocks

**Converting blocks to markdown:**

Each block has a `type` and `text`:

- `unstyled` → plain paragraph
- `header-one` → `# heading`
- `header-two` → `## heading`
- `header-three` → `### heading`
- `blockquote` → `> quote`
- `code-block` → fenced code block
- `unordered-list-item` → `- list item`
- `ordered-list-item` → `1. list item`
- `atomic` → look up in entityMap for embedded media/links

**Resolving entity ranges:**

Each block may have `entityRanges: [{ key, offset, length }]`. Look up `content.entityMap[key]`:

- If `type: "LINK"` → wrap the text span in `[text](url)` using `data.url`
- If `type: "IMAGE"` → insert `![](data.src)`

**Resolving inline styles:**

Each block may have `inlineStyleRanges: [{ style, offset, length }]`:

- `BOLD` → `**text**`
- `ITALIC` → `*text*`
- `CODE` → `` `text` ``

Format the full article as:

```
# {article.title}

**@{author.screen_name}** · {article.created_at}

{converted markdown content}

---
Likes: {likes} · Retweets: {retweets} · Views: {views}
```

### Reddit

**URL patterns**: `reddit.com/r/*/comments/*`, `old.reddit.com/r/*/comments/*`

**Proxy**: Append `.json` to the Reddit URL path

**Steps**:

1. Normalize URL to `https://www.reddit.com/...`
2. Remove any trailing query params, ensure path ends with `/`
3. Append `.json` to the path
4. Fetch using WebFetch
5. The response is an array of two listings:
   - `[0].data.children[0].data` → the post
   - `[1].data.children[*].data` → top-level comments

Format as:

```
**r/{subreddit}** · u/{author} · {score} points

# {title}

{selftext_html or selftext, or url if link post}

---
Top comments:

**u/{comment_author}** ({score} pts)
{comment body}
```

Show the top 5 comments by default. Offer to show more if the user asks.

## Adding New Platforms

To extend this skill for a new platform:

1. Add a new section with URL patterns and proxy strategy
2. Document the JSON response shape
3. Add formatting instructions

## General Guidelines

- Always attempt the proxy fetch — do not tell the user you can't access the URL without trying first
- If the proxy returns an error, explain clearly (e.g., "Tweet not found", "Account is private")
- For tweet threads, fetch the main tweet first and offer to follow the conversation
- Present image/video URLs directly so the user can open them
- Keep formatting clean and focused on the content
