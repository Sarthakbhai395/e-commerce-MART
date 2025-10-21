import React from 'react';
import { Link } from 'react-router-dom';

export const CategoryNav = () => {
  const categories = [
    { id: 1, name: 'Electronics', icon: '📱' },
    { id: 2, name: 'TVs & Appliances', icon: '📺' },
    { id: 3, name: 'Men', icon: '👕' },
    { id: 4, name: 'Women', icon: '👗' },
    { id: 5, name: 'Baby & Kids', icon: '👶' },
    { id: 6, name: 'Home & Furniture', icon: '🏠' },
    { id: 7, name: 'Sports, Books & More', icon: '📚' },
    { id: 8, name: 'Flights', icon: '✈️' },
    { id: 9, name: 'Offer Zone', icon: '🔥' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm border-t border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-4 space-x-8 hide-scrollbar">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.name.toLowerCase()}`}
              className="flex flex-col items-center flex-shrink-0 text-gray-700 hover:text-blue-600 group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
              <span className="text-sm whitespace-nowrap font-medium group-hover:text-blue-600">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};