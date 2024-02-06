export default function NoticeCreate() {
  return (
    <section className="mt-5 flex min-h-full flex-col justify-center border-2 border-teal-600 px-6 py-12 lg:px-8">
      <form action="">
        <div>
          <label
            htmlFor="UserEmail"
            className="block text-xs font-medium text-gray-700"
          >
            {' '}
            Title{' '}
          </label>

          <input
            type="email"
            id="UserEmail"
            placeholder="john@rhcp.com"
            className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="HeadlineAct"
            className="block text-xs font-medium text-gray-700"
          >
            {' '}
            Headliner{' '}
          </label>

          <select
            name="HeadlineAct"
            id="HeadlineAct"
            className="mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm"
          >
            <option value="">Please select</option>
            <option value="JM">John Mayer</option>
            <option value="SRV">Stevie Ray Vaughn</option>
            <option value="JH">Jimi Hendrix</option>
            <option value="BBK">B.B King</option>
            <option value="AK">Albert King</option>
            <option value="BG">Buddy Guy</option>
            <option value="EC">Eric Clapton</option>
          </select>
        </div>

        <div className="mt-5">
          <label
            htmlFor="OrderNotes"
            className="block text-xs font-medium text-gray-700"
          >
            {' '}
            Content{' '}
          </label>

          <textarea
            id="OrderNotes"
            className="mt-2 w-full rounded-lg border-gray-200 align-top shadow-sm sm:text-sm"
            placeholder="Enter any additional order notes..."
          ></textarea>
        </div>

        <div className="mt-5 flex justify-center gap-2.5">
          <a
            className="inline-block rounded border border-teal-600 bg-teal-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-teal-600 focus:outline-none focus:ring active:text-teal-500"
            href="/"
          >
            back
          </a>

          <button
            type="submit"
            className="inline-block rounded border border-teal-600 px-12 py-3 text-sm font-medium text-teal-600 hover:bg-teal-600 hover:text-white focus:outline-none focus:ring active:bg-teal-500"
          >
            submit
          </button>
        </div>
      </form>
    </section>
  );
}
