"use client";

import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Loader from "@/components/shared/Loader";
import CheckBox from "@/components/shared/CheckBox";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/redux/services/adminServices";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  credit: number;
}

interface AddUserFormProps {
  close: () => void;
  onSuccess: () => void;
  defaultValue?: User;
}

function AddUserForm({ close, onSuccess, defaultValue }: AddUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
    credit: 0,
  });

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Update form data when defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      setFormData({
        name: defaultValue.name,
        email: defaultValue.email,
        password: "", // Don't populate password for security
        isAdmin: defaultValue.isAdmin,
        credit: defaultValue.credit,
      });
    } else {
      // Reset form for new user
      setFormData({
        name: "",
        email: "",
        password: "",
        isAdmin: false,
        credit: 0,
      });
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? 0
              : Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!defaultValue && !formData.password.trim()) {
      toast.error("Password is required for new users");
      return;
    }
    if (formData.credit < 0) {
      toast.error("Credit cannot be negative");
      return;
    }

    try {
      setIsLoading(true);

      const dataToSubmit = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        isAdmin: formData.isAdmin,
        credit: formData.credit,
        ...(formData.password.trim() && { password: formData.password.trim() }),
      };

      if (defaultValue) {
        await updateUser({
          id: defaultValue.id,
          data: dataToSubmit,
        }).unwrap();
      } else {
        await createUser(dataToSubmit).unwrap();
      }

      onSuccess();
      close();
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to save user",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="w-full p-6">
      <h2 className="mb-6 text-2xl font-bold text-black">
        {defaultValue ? "Edit User" : "Create User"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Details */}
        <div className="space-y-4">
          <Input
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
          />

          <Input
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
          />

          <Input
            name="password"
            label={
              defaultValue
                ? "New Password (leave empty to keep current)"
                : "Password"
            }
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={
              defaultValue
                ? "Leave empty to keep current password"
                : "Enter password"
            }
            required={!defaultValue}
          />

          <Input
            name="credit"
            label="Credit Balance"
            type="number"
            value={formData.credit}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
          />

          <div className="flex items-center gap-2">
            <CheckBox
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleInputChange}
              className="h-5 w-5 cursor-pointer"
            />
            <label
              htmlFor="isAdmin"
              className="cursor-pointer text-sm font-medium text-black"
            >
              Administrator Access
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" className="flex-1 bg-primary text-white">
            {defaultValue ? "Update User" : "Create User"}
          </Button>
          <Button
            type="button"
            onClick={close}
            className="bg-bodydark2 flex-1 text-black"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddUserForm;
