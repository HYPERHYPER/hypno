import Head from "next/head";

export default function mobileCancel() {
  return (
    <>
      <Head>
        <title>hypno™</title>
        <meta
          name="description"
          content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col w-full items-center p-6">
        <h1 className="animate-bounce mt-4 mb-3">↓</h1>
        <h2>pull down to return to app</h2>
      </div>
    </>
  );
}
