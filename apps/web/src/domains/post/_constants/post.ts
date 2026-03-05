export const TYPE_OPTIONS = [
  { value: '', label: 'Please select' },
  { value: 'free', label: 'Free' },
  { value: 'notice', label: 'Notice' },
  { value: 'faq', label: 'Faq' },
];

export const LIST_TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'notice', label: 'Notice' },
  { value: 'faq', label: 'Faq' },
];

export const PAGE_GROUP_NUMBER = 10;

export const DUMMY_DATA = Array.from({ length: PAGE_GROUP_NUMBER }, (_, i) => ({
  id: i,
  title: `Title ${i}`,
  type: 'Type',
}));
