export default function InstituteForm({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-xl">
        {/* Institute Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
           {" Institute's Name"}
          </label>
          <input
            list="institute-names"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
            placeholder="Institute's name"
          />
          <datalist id="institute-names">
            <option value="জামিয়া ইসলামিয়া" />
            <option value="আনোয়ারুল উলূম" />
          </datalist>
        </div>

        {/* Address */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Address
          </label>
          <div className="flex gap-2">
            <div className="w-1/2">
              <input
                list="address-options"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Institute's Address"
              />
              <datalist id="address-options">
                <option value="Dhaka" />
                <option value="Chittagong" />
              </datalist>
            </div>
            <div className="flex w-1/2 items-center gap-2">
              <input type="checkbox" id="add-address" />
              <label htmlFor="add-address" className="text-sm text-gray-700">
                Add
              </label>
            </div>
          </div>
        </div>

        {/* Class Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Class Name
          </label>
          <input
            list="class-names"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
            placeholder="Class Name"
          />
          <datalist id="class-names">
            <option value="Nursery" />
            <option value="Class One" />
            <option value="Class Two" />
          </datalist>
        </div>

        {/* Book Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {"Book's Name"}
          </label>
          <input
            list="book-names"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
            placeholder="Book's Name"
          />
          <datalist id="book-names">
            <option value="Bangla 1st Paper" />
            <option value="Quran Majeed" />
          </datalist>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-between pt-4">
          <button
            onClick={onBack}
            className="h-8 w-[70px] rounded-md bg-gray-700 text-white"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="h-8 w-[70px] rounded-md bg-purple-800 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
