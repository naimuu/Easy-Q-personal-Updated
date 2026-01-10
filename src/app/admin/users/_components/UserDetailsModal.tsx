"use client";

import React from "react";
import { X } from "lucide-react";
import { useGetUserDetailsQuery } from "@/redux/services/adminServices";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isAdmin: boolean;
  credit: number;
  createAt: string;
  passwordUpdateAt: string;
  institute?: Array<{
    id: string;
    name: string;
    phone: string;
    address?: string;
    date: string;
  }>;
  _count: {
    question_set: number;
    exams: number;
    subscriptions: number;
    payments: number;
  };
  subscriptions?: Array<{
    id: string;
    package: {
      displayName: string;
      duration: string;
    };
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>;
}

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const { data: detailedUser, isLoading } = useGetUserDetailsQuery(
    user?.id || "",
    {
      skip: !user?.id || !isOpen,
    },
  );

  if (!isOpen || !user) return null;

  const displayUser = detailedUser || user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">User Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {displayUser.image ? (
                    <img
                      src={displayUser.image}
                      alt={displayUser.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold text-gray-600">
                      {displayUser.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-black">
                      {displayUser.name}
                    </h3>
                    <p className="text-gray-600">{displayUser.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Role:</span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        displayUser.isAdmin
                          ? "bg-purple-200 text-purple-900"
                          : "bg-blue-200 text-blue-900"
                      }`}
                    >
                      {displayUser.isAdmin ? "Administrator" : "Regular User"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">
                      Credit Balance:
                    </span>
                    <span className="text-gray-900">{displayUser.credit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Joined:</span>
                    <span className="text-gray-900">
                      {new Date(displayUser.createAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">
                      Last Password Update:
                    </span>
                    <span className="text-gray-900">
                      {new Date(
                        displayUser.passwordUpdateAt,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-black">
                  Activity Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {displayUser._count.question_set}
                    </div>
                    <div className="text-sm text-gray-600">Question Sets</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {displayUser._count.exams}
                    </div>
                    <div className="text-sm text-gray-600">Exams</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {displayUser._count.subscriptions}
                    </div>
                    <div className="text-sm text-gray-600">Subscriptions</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {displayUser._count.payments}
                    </div>
                    <div className="text-sm text-gray-600">Payments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Institute Information */}
            {displayUser.institute && displayUser.institute.length > 0 && (
              <div>
                <h4 className="mb-3 text-lg font-semibold text-black">
                  Institute Information
                </h4>
                <div className="space-y-3">
                  {displayUser.institute?.map(
                    (inst: {
                      id: string;
                      name: string;
                      phone: string;
                      address?: string;
                      date: string;
                    }) => (
                      <div
                        key={inst.id}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div>
                            <span className="font-medium text-gray-700">
                              Name:
                            </span>{" "}
                            {inst.name}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Phone:
                            </span>{" "}
                            {inst.phone}
                          </div>
                          {inst.address && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">
                                Address:
                              </span>{" "}
                              {inst.address}
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-700">
                              Created:
                            </span>{" "}
                            {new Date(inst.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Active Subscription */}
            {displayUser.subscriptions &&
              displayUser.subscriptions.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-black">
                    Current Subscription
                  </h4>
                  <div className="rounded-lg border border-gray-200 p-4">
                    {displayUser.subscriptions
                      ?.filter(
                        (sub: {
                          id: string;
                          package: { displayName: string; duration: string };
                          startDate: string;
                          endDate: string;
                          isActive: boolean;
                        }) => sub.isActive,
                      )
                      .slice(0, 1)
                      .map(
                        (sub: {
                          id: string;
                          package: { displayName: string; duration: string };
                          startDate: string;
                          endDate: string;
                          isActive: boolean;
                        }) => (
                          <div
                            key={sub.id}
                            className="grid grid-cols-1 gap-2 md:grid-cols-2"
                          >
                            <div>
                              <span className="font-medium text-gray-700">
                                Package:
                              </span>{" "}
                              {sub.package.displayName}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Duration:
                              </span>{" "}
                              {sub.package.duration}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Start Date:
                              </span>{" "}
                              {new Date(sub.startDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                End Date:
                              </span>{" "}
                              {new Date(sub.endDate).toLocaleDateString()}
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">
                                Status:
                              </span>{" "}
                              <span className="inline-flex rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-900">
                                Active
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    {displayUser.subscriptions?.filter(
                      (sub: {
                        id: string;
                        package: { displayName: string; duration: string };
                        startDate: string;
                        endDate: string;
                        isActive: boolean;
                      }) => sub.isActive,
                    ).length === 0 && (
                      <p className="text-gray-600">No active subscription</p>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetailsModal;
