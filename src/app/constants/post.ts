const TYPE_OPTIONS = [
  { value: '', label: 'Please select' },
  { value: 'free', label: 'Free' },
  { value: 'notice', label: 'Notice' },
  { value: 'faq', label: 'Faq' },
];

const LIST_TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'notice', label: 'Notice' },
  { value: 'faq', label: 'Faq' },
];

const PAGE_GROUP_NUMBER = 10;

const DUMMY_DATA = Array.from({ length: PAGE_GROUP_NUMBER }, (_, i) => ({
  id: i,
  title: `Title ${i}`,
  type: 'Type',
}));

export { TYPE_OPTIONS, LIST_TYPE_OPTIONS, PAGE_GROUP_NUMBER, DUMMY_DATA };
