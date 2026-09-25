// utils/common.js

import { useRouter } from 'next/router';
import Link from 'next/link';
// Title Case function: Converts a string to title case
function titleCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


const Breadcrumbs = () => {
  const router = useRouter();
  const pathSegments = router.asPath.split('/').filter((segment) => segment);

  return (
    <nav>
      <ul className="flex space-x-2 text-gray-500">
        <li>
          <Link href="/" className="text-blue-600">Home</Link> &gt;
        </li>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
          return (
            <li key={index}>
              {index < pathSegments.length - 1 ? (
                <Link href={path} className="text-blue-600">{decodeURIComponent(segment)}</Link>
              ) : (
                <span>{decodeURIComponent(segment)}</span>
              )}
              {index < pathSegments.length - 1 && " > "}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};



// Export functions
module.exports = {
    titleCase,Breadcrumbs
};
