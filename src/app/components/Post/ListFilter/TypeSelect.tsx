import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';

import { LIST_TYPE_OPTIONS } from '@/app/constants/post';

interface Props {
  onChange: () => void;
}

export default function TypeSelect({ onChange }: Props) {
  const { register, watch, setValue } = useFormContext();

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="type" className="sr-only">
          Type
        </label>

        <select
          id="type"
          className="w-full rounded-md border-gray-200"
          defaultValue={''}
          {...register('type')}
          onChange={onChange}
        >
          {LIST_TYPE_OPTIONS.map(option => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <nav className="flex gap-6" aria-label="Tabs">
          {LIST_TYPE_OPTIONS.map(option => (
            <a
              key={option.label}
              href="#"
              className={classNames(
                'shrink-0 rounded-lg p-2 text-sm font-medium',
                {
                  'text-gray-500 hover:bg-gray-50 hover:text-gray-700':
                    option.value !== watch('type'),
                },
                {
                  'bg-sky-100 text-sky-600': option.value === watch('type'),
                }
              )}
              onClick={e => {
                e.preventDefault();
                setValue('type', option.value);
                onChange();
              }}
            >
              {option.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
