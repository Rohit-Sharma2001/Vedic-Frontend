
import Link from 'next/link';

const Breadcrumbs = () => {
  

  const pathSegments =[]

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

export default Breadcrumbs;
