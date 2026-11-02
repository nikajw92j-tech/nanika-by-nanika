// ბრენდის ფერის მსუბუქი blur placeholder next/image-ისთვის (დისტანციური ფოტოებისთვისაც მუშაობს)
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10"><filter id="b"><feGaussianBlur stdDeviation="2"/></filter><rect width="8" height="10" fill="#E8DED3"/><rect x="1" y="2" width="6" height="7" fill="#d8c8b8" filter="url(#b)"/></svg>';
export const BLUR_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
