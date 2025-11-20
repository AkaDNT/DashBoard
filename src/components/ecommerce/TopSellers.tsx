// app/(admin)/components/TopSellers.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";

interface TopSeller {
  id: number;
  name: string;
  category: string;
  salesVolume: number;
  image: string;
  rating: number; // 1-5
}

const sellers: TopSeller[] = [
  {
    id: 1,
    name: "MacBook pro 13’’",
    category: "Laptop",
    salesVolume: 500,
    image: "/images/product/product-01.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    category: "Watch",
    salesVolume: 400,
    image: "/images/product/product-02.jpg",
    rating: 5,
  },
  {
    id: 3,
    name: "iPhone 15 Pro Max",
    category: "SmartPhone",
    salesVolume: 350,
    image: "/images/product/product-03.jpg",
    rating: 5,
  },
  {
    id: 4,
    name: "iPad Pro 3rd Gen",
    category: "Electronics",
    salesVolume: 260,
    image: "/images/product/product-04.jpg",
    rating: 5,
  },
  {
    id: 5,
    name: "AirPods Pro 2nd Gen",
    category: "Accessories",
    salesVolume: 160,
    image: "/images/product/product-05.jpg",
    rating: 5,
  },
];

export default function TopSellers() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Sellers
        </h3>

        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
          See all
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Products
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Sales Volume
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Rating
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sellers.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image
                        width={50}
                        height={50}
                        src={product.image}
                        className="h-[50px] w-[50px]"
                        alt={product.name}
                      />
                    </div>
                    <div>
                      <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {product.name}
                      </p>
                      <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                        1 Variant
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {product.category}
                </TableCell>

                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {product.salesVolume}
                </TableCell>

                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>{product.rating}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      className="fill-yellow-400 text-yellow-400"
                    >
                      <path d="M10 1.66797L12.575 6.52564L17.917 7.35064L13.958 11.1923L14.85 16.5173L10 14.1006L5.15 16.5173L6.042 11.1923L2.083 7.35064L7.425 6.52564L10 1.66797Z" />
                    </svg>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
