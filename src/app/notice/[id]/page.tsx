export default function NoticeDetail() {
  return (
    <section className="pb-8 pt-8">
      <div className="flex justify-between">
        <div>
          <div className="sm:hidden">
            <label htmlFor="Tab" className="sr-only">
              Tab
            </label>

            <select id="Tab" className="w-full rounded-md border-gray-200">
              <option>Settings</option>
              <option>Messages</option>
              <option>Archive</option>
              <option selected={true}>Notifications</option>
            </select>
          </div>

          <div className="hidden sm:block">
            <nav className="flex gap-6" aria-label="Tabs">
              <a
                href="#"
                className="shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                Settings
              </a>

              <a
                href="#"
                className="shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                Messages
              </a>

              <a
                href="#"
                className="shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                Archive
              </a>

              <a
                href="#"
                className="shrink-0 rounded-lg bg-sky-100 p-2 text-sm font-medium text-sky-600"
                aria-current="page"
              >
                Notifications
              </a>
            </nav>
          </div>
        </div>

        <div className="relative">
          <label htmlFor="Search" className="sr-only">
            {' '}
            Search{' '}
          </label>

          <input
            type="text"
            id="Search"
            placeholder="Search for..."
            className="w-full rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm"
          />

          <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
            <button type="button" className="text-gray-600 hover:text-gray-700">
              <span className="sr-only">Search</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div>
          <h4 className="border-b-2 border-b-teal-600 font-bold p-2 text-xl">제목</h4>

          <div className="flex justify-between text-base bg-teal-100 p-2">
            <span>작성자</span>
            <span>1분 전</span>
          </div>
        </div>

        <div className="pt-5 pb-5 pl-2 pr-2 text-base border-b-2">
          <p>내용</p>
        </div>
      </div>
    </section>
  );
}