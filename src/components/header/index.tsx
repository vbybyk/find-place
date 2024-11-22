"use client";

import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          {/* <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
          </a> */}
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:space-x-6">
          <Link href="/" className="text-sm font-semibold leading-6 text-gray-900">
            Home
          </Link>
          <Link href="/listings?type=2" className="text-sm font-semibold leading-6 text-gray-900">
            Buy
          </Link>
          <Link href="/listings?type=1" className="text-sm font-semibold leading-6 text-gray-900">
            Rent
          </Link>
          <Link href="/listings?userId=1" className="text-sm font-semibold leading-6 text-gray-900">
            Manage Rentals
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:space-x-6 lg:items-center">
          <Link href="#" className="text-sm font-medium text-gray-900 hover:text-gray-900">
            Log in
          </Link>
          <Link
            href="/listings/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Property
          </Link>
        </div>
      </nav>
      <dialog className="lg:hidden" aria-hidden="true" open={mobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6">
              <Link href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close main menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="pt-6 pb-6 px-6 space-y-6 flex-1">
              <Link href="#" className="block text-sm font-medium text-gray-900 hover:text-gray-900">
                Buy
              </Link>
              <Link href="#" className="block text-sm font-medium text-gray-900 hover:text-gray-900">
                Rent
              </Link>
              <Link href="#" className="block text-sm font-medium text-gray-900 hover:text-gray-900">
                Manage
              </Link>
            </div>
            <div className="border-t border-gray-200 pt-6 pb-6 px-6">
              <Link href="#" className="block text-sm font-medium text-gray-900 hover:text-gray-900">
                Log in
              </Link>
              <Link
                href="#"
                className="block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </dialog>
    </header>
  );
};

export default Header;
