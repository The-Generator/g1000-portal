'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface UnauthorizedBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  businessName: string;
  contactName: string;
}

export default function UnauthorizedBusinessModal({
  isOpen,
  onClose,
  email,
  businessName,
  contactName,
}: UnauthorizedBusinessModalProps) {
  const handleEmailAdmin = () => {
    const subject = encodeURIComponent(`New Business Registration Request - ${businessName}`);
    const body = encodeURIComponent(
      `Hello,\n\nA new business is attempting to register on the G1000 Portal:\n\n` +
      `Business Name: ${businessName}\n` +
      `Contact Name: ${contactName}\n` +
      `Email: ${email}\n\n` +
      `Please review this registration request and add this email to the approved list if appropriate.\n\n` +
      `Thank you`
    );

    window.location.href = `mailto:gmestler1@babson.edu?subject=${subject}&body=${body}`;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <button
                  type="button"
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Registration Pending Approval
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Thank you for your interest in joining the G1000 Portal! Your business email address is not yet in our approved list.
                      </p>
                      <p className="mt-3 text-sm text-gray-500">
                        Please click the button below to notify the administrator about your registration request. We will review your application and get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 space-y-3">
                  <Button
                    onClick={handleEmailAdmin}
                    className="w-full justify-center"
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                  >
                    Email Administrator
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full justify-center"
                  >
                    Close
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Only approved business emails can register on the platform. This helps us maintain quality and ensure authentic business partnerships.
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}