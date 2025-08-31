import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          FAQサイトが見つかりません
        </h1>
        <p className="text-gray-600 mb-8">
          指定されたドメインのFAQサイトは存在しないか、削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
