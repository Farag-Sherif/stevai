"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { getCities } from "@/api/main";
import { usePathname } from "@/router/navigation";
import { useTranslations } from "@/i18n/react";
import toast from "react-hot-toast";
import { useAddresses } from "@/hooks/queries/useAddresses";
import { useAddressMutations } from "@/hooks/mutations/useAddressMutations";

export default function Address() {
  const pathname = usePathname();
  const isArabic = typeof pathname === "string" && pathname.startsWith("/ar");
  const t = useTranslations("myAccount");
  const { user } = useUserStore();
  const { addresses, isLoading: isAddressesLoading } = useAddresses();
  const { createMutation, deleteMutation, editMutation } = useAddressMutations();
  
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [createSelectedCityId, setCreateSelectedCityId] = useState("");
  const [editSelectedCityById, setEditSelectedCityById] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => getCities(),
    staleTime: 24 * 60 * 60 * 1000, // Cities don't change often
  });

  const getStateName = (state) => {
    const locale = isArabic ? "ar" : "en";
    if (state?.translations && Array.isArray(state.translations)) {
      const translation = state.translations.find((t) => t.locale === locale);
      if (translation?.name) {
        return translation.name;
      }
    }
    return state?.name || "";
  };

  const isLoading = !user || isAddressesLoading;

  // Helper function to get city name by ID
  const getCityNameById = (cityId) => {
    const city = cities?.find((c) => c.id === parseInt(cityId));
    return city ? city.name : cityId;
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const selectedCity = cities?.find(
      (c) => String(c.id) === String(formData.get("city"))
    );
    const hasStates = selectedCity?.states && selectedCity.states.length > 0;

    const addressData = {
      f_name: formData.get("firstName"),
      l_name: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      state: hasStates ? formData.get("state") || "" : "",
      home_phone: formData.get("home_phone") || "",
    };

    createMutation.mutate(addressData, {
      onSuccess: () => {
        setShowCreateForm(false);
        toast.success(isArabic ? "تم إضافة العنوان بنجاح" : "Address added successfully");
      },
      onError: () => toast.error(isArabic ? "فشل إضافة العنوان" : "Failed to add address"),
    });
  };

  const handleEditSubmit = (e, addressId) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const selectedCity = cities?.find(
      (c) => String(c.id) === String(formData.get("city"))
    );
    const hasStates = selectedCity?.states && selectedCity.states.length > 0;

    const addressData = {
      id: addressId,
      f_name: formData.get("firstName"),
      l_name: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      state: hasStates ? formData.get("state") || "" : "",
      home_phone: formData.get("home_phone") || "",
    };

    editMutation.mutate(addressData, {
      onSuccess: () => {
        setEditingAddressId(null);
        toast.success(isArabic ? "تم تحديث العنوان بنجاح" : "Address updated successfully");
      },
      onError: () => toast.error(isArabic ? "فشل تحديث العنوان" : "Failed to update address"),
    });
  };

  const handleEditToggle = (id) => {
    setEditingAddressId(editingAddressId === id ? null : id);
  };
  const handleDelete = (id) => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success(isArabic ? "تم حذف العنوان بنجاح" : "Address deleted successfully"),
      onError: () => toast.error(isArabic ? "فشل حذف العنوان" : "Failed to delete address"),
    });
  };

  if (isLoading) {
    return (
      <div className="my-account-content">
        <div className="account-address">
          <div className="text-center">
            <p>{t("loadingAddresses")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="account-address">
        {/* User Profile Section */}
        <div className="user-profile-section mb_30 text-center">
          <div className="user-avatar mb_15">
            <img
              src={
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAAAbFBMVEX///8jHyAAAAD8/PwgHB3l5OQPCwxlZGX6+foiHR/x8fEWEhMcFxgaFRb09PQlHyEKAABramvW1daysLEzMDF+fX5xcHGmpKXAwMCfn5+SkZFeXF3q6uotKit3dneFg4RPT0/Lyco8OjtDQkLePqipAAAG1ElEQVR4nO2cC5eyLBDHBRFRtLxk3vP2/b/jC2i97T67ZbomnTO/09ntYsbfgWGAQcMAAAAAAAAAAAAAAAAAAAAAAAAAAACYh2nenrmVZVUVu71Wj0/CVAVmVpYWzTm07fCcNHkcHdRn5meJkeVlUXop+5oGVIEDcmrDojvcW+0jEKXNLj3inBOkEP8I8cTLk53uXbhXUDUs64nvT0LuIZ7PUcrG4z6j8VglJj8ouQrCp+xjtFSFaB+/SpFqfBxaHyHFjErsoUdiZPvBfcyen2tXxLVm8RA8ssokBlEvr/Q2DjMOeU2faJnwcWIpJ62to2YF4vO0IOQFl0rrcKCg/nGuGNFwzpW+djFy6s2WghwH4bO+wU1G/PlahBpEgmLvMv+G1c9uL7eaRmI92wyzX9YifNoQ7V3uH8kfRDC/m4aeD3sX/AeidmYH8xVex3uX/BvCIbnNIi3oSEvNKpoQ073e+kcIT7VyAaIwhwYv04IQLXWLoKOBP4yUfzeMGK/FWkkR8eWyFqMIwmrv8n/BKleIISTSqpp1/IWg7B9wrtNAjRWLm78SY7v6WMZ07Wejy4d41Npbwh0WJvOHMf/i4GxvBXd0+LhGDMKFPtXMyDFaJ6bUR4yZ4KOzRgwd9HFn5rr2j45erU+3abbrxCCH6BM5s2FF/y+1OFQfMYdhYfh/FXPE3d4abqwVIzoancSsq2bICfSpZmsdACFcIzHhqjgTIV8n17x8zDxCW306TSNdG86E+oQzItBcKUanKWer9lbFZhp5ZsNwz+sGZ0inwRnL1w2bQ3dvBf9jGpG3akIj1mjByTQqe7FpCOK1TrXMNFhMF81njoZpNKplcsk8Wj4L6NU6TWfIRQCWC9Msc8/4ok8sMxGV3FkgxnF8ZRh9HIDEjOuXlponjoSLFqOXFIF7WdRqaKtP9H9Hd1ow3iRkTAzUzDamkXKCXvIC5IhoopmMEVEoNax5KXz2hko3oyhkDkyJj/OnNgnxPK5h4zfGvsZgJXZesAw9RVMCtG6o7KSqVEtoc6wjnPLQaZvTZKiIM0EcPe89iVxhKvVayvyOuMxVfgrmWIZ7SaSdR/6KaAGHrHyeQkdon+vpx+6QTcCMGowfDwgotjtmaJxreofb2TgYm8ZReDdnaiXTH8TxEFcfIEMii+l27dU6k68mVy0BrtPqE0yikDVNbjg5Y4y5XEi6WgQRT7xVxjpmy/3GrRtkXdM6nHLOfV88KCX9Oa7kuFQJ3reU8zGvf5jV5YndCspzEUfu9OknaQEAAAAA4AHmT88YO3yBsS8Rpvn1cJ2QMxoj7FBZURRlcV4kl9AuFXZ4SYo8zsQHlXu47aHVk7FkzLWiLC3ObU3xRDBxfc378lLEXWQpRdoKkjvmm/LEpQL/tpvm+9wT8aUurw+FIu0WM6Zr60ZxUfYcUz5rDc0Tkr32nGeWeX8WLbDipBVCXlumJTzAJ7vopuq2u57RO0VNW/N5FvmOz9EQxq6cCtl9LK1mY+zep7cx/ouSCHJ8Xre5DpYRFSwhVN7G4OgsWgaUXyOE43bvVVpxKd3i2RzZTHy89xIa68q/kSKoKcl3zAcw3ZQELzeS3yDIw2HE9mo4UfPklgyvaXGOBA/ZDimB8vpFYxVz/kbO0ZGhQnDaYZ+j8MjRsDIx80e8XbZsdWvz/39TQ9+f4hi1dFVW5gM1fv7mmmbZizJlZkCI99at2+bS1JKZ+PU773hg5t5feeR/IW/Op8nm349lGfK2J2/CWrkr6zmEpm8KBdjaZPkZ8HfdWiNakor1IkfcHIyte085FmswWreRcQ4e6rYeecrTR4szS+cjLlZQso39s1yKFIYhG3WY/yPOj7fORpF5S8GaRPkXCOwtlYxi1u38f4XNTcOMN7iyq5jLlkrkhcreZhhE+NZTAsnWnf8deOPo2T1tF2H+Ay+3FZP92QTGDLyN99UUb/LLCnkntw1h4ZLNC4vF8GZLMVb7Tssgv5TDmk36GhGYxfUbmwxBfr/Z/k3Z/b+tx5zk5FuJEVwe3+33z7UEyXZaXFttKnmfGC/cKJ9TDmVa7HOF7/uegNyYfn56chX8w/0b79+5/96EPOv0G+JX5JrNVrFmlNh2WcqMy2EY+v50OtV1jeTOEUqvq/3iCZ1FoL6jsgQo5eLCIHEyccq+H4ZWZXWWtp1sJEYMzJgrb/Evky+6rsuyLI7jNM3zvFA0TZMkyeVyOUtCgT2hEjQm5PvqAHGgOFx8afy2OE2aihOK03ad+AXxO1blumyrYcCzMblpMJUs4wrNCusHxk/EISqV5unQWIM1aAAAAAAAAAAAAAAAAAAAAAAAAAAAduQ//z9peKu4TucAAAAASUVORK5CYII="
              }
              alt={`${user?.fname || "User"} Avatar`}
              className="avatar-image"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #f0f0f0",
              }}
            />
          </div>
          <div className="user-info">
            <h5 className="user-name mb_5">
              {user?.fname && user?.lname
                ? `${user.fname} ${user.lname}`
                : user?.email || "User"}
            </h5>
            <p className="user-email text-secondary">{user?.email}</p>
          </div>
        </div>

        <div className="text-center widget-inner-address">
          <button
            className="tf-btn btn-fill radius-4 mb_20 btn-address"
            onClick={() => setShowCreateForm((v) => !v)}
          >
            <span className="text text-caption-1">
              {t("addAddress")}
            </span>
          </button>
          <form
            className={`show-form-address wd-form-address createForm ${showCreateForm ? "d-block" : ""}`}
            onSubmit={handleCreateSubmit}
            style={{ display: showCreateForm ? "block" : "none" }}
          >
            <div className="title">
              {t("addAddress")}
            </div>
            <div className="cols mb_20">
              <fieldset className="">
                <input
                  className=""
                  type="text"
                  placeholder={`${t("firstName")}*`}
                  name="firstName"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
              <fieldset className="">
                <input
                  className=""
                  type="text"
                  placeholder={`${t("lastName")}*`}
                  name="lastName"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
            </div>
            <div className="cols mb_20">
              <fieldset className="">
                <input
                  className=""
                  type="email"
                  placeholder={`${t("email")}*`}
                  name="email"
                  tabIndex={2}
                  defaultValue={user?.email || ""}
                  aria-required="true"
                  required
                />
              </fieldset>
              <fieldset className="">
                <input
                  className=""
                  type="text"
                  placeholder={`${t("phone")}*`}
                  name="phone"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
            </div>
            <fieldset className="mb_20">
              <select
                className=""
                name="city"
                tabIndex={2}
                aria-required="true"
                required
                onChange={(e) => {
                  setCreateSelectedCityId(e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "white",
                }}
              >
                <option value="">
                  {t("selectState")}*
                </option>
                {cities?.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </fieldset>
            {(() => {
              const selectedCity = cities?.find(
                (c) => String(c.id) === String(createSelectedCityId)
              );
              const hasStates =
                selectedCity?.states && selectedCity.states.length > 0;
              return (
                <fieldset className="mb_20">
                  <select
                    className=""
                    name="state"
                    tabIndex={2}
                    aria-required={hasStates ? "true" : "false"}
                    required={hasStates}
                    disabled={!createSelectedCityId || !hasStates}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">
                      {t("selectCity")}
                      {hasStates ? "*" : ""}
                    </option>
                    {selectedCity?.states?.map((state) => (
                      <option key={state.id} value={state.id}>
                        {getStateName(state)}
                      </option>
                    ))}
                  </select>
                </fieldset>
              );
            })()}
            <fieldset className="mb_20">
              <input
                className=""
                type="text"
                placeholder={t(
                  "additionalPhone"
                )}
                name="home_phone"
                tabIndex={2}
                defaultValue=""
                aria-required="false"
              />
            </fieldset>
            <div className="d-flex align-items-center justify-content-center gap-20">
              <button
                type="submit"
                className="tf-btn btn-fill radius-4"
                disabled={createMutation.isPending}
              >
                <span className="text">
                  {createMutation.isPending
                    ? t("adding")
                    : t("addAddress")}
                </span>
              </button>
              <span
                className="tf-btn btn-fill radius-4 btn-hide-address"
                onClick={() => setShowCreateForm(false)}
              >
                <span className="text">
                  {t("close")}
                </span>
              </span>
            </div>
          </form>
          <div className="list-account-address mx-auto justify-content-center">
            {addresses.length === 0 ? (
              <p className="text-center">
                {t("noAddresses")}
              </p>
            ) : (
              addresses.map((address) => (
                <div
                  className="account-address-item text-center mx-auto"
                  key={address.id}
                >
                  <h6 className="mb_20">
                    {t("address")} #
                    {address.id}
                  </h6>
                  <p>
                    {address.f_name} {address.l_name}
                  </p>
                  <p>{address.email}</p>
                  <p>{getCityNameById(address.city)}</p>
                  <p className="mb_10">{address.phone}</p>
                  <div className="d-flex gap-10 justify-content-center">
                    <button
                      className="tf-btn radius-4 btn-fill justify-content-center btn-edit-address"
                      onClick={() => handleEditToggle(address.id)}
                    >
                      <span className="text">
                        {editingAddressId === address.id
                          ? t("cancel")
                          : t("edit")}
                      </span>
                    </button>
                    <button
                      className="tf-btn radius-4 btn-outline justify-content-center btn-delete-address"
                      onClick={() => handleDelete(address.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <span className="text">
                        {deleteMutation.isPending ? t("deleting") : t("delete")}
                      </span>
                    </button>
                  </div>
                  {editingAddressId === address.id && (
                    <form
                      className="edit-form-address wd-form-address d-block"
                      onSubmit={(e) => handleEditSubmit(e, address.id)}
                    >
                      <div className="title">
                        {t("updateAddress")}
                      </div>
                      <fieldset className="mb_20">
                        <input
                          type="text"
                          placeholder={`${t(
                            "firstName"
                          )}*`}
                          name="firstName"
                          defaultValue={address.f_name}
                          required
                        />
                      </fieldset>
                      <fieldset className="mb_20">
                        <input
                          type="text"
                          placeholder={`${t("lastName")}*`}
                          name="lastName"
                          defaultValue={address.l_name}
                          required
                        />
                      </fieldset>
                      <fieldset className="mb_20">
                        <input
                          type="email"
                          placeholder={`${t("email")}*`}
                          name="email"
                          defaultValue={address.email}
                          required
                        />
                      </fieldset>
                      <fieldset className="mb_20">
                        <input
                          type="text"
                          placeholder={`${t("phone")}*`}
                          name="phone"
                          defaultValue={address.phone}
                          required
                        />
                      </fieldset>
                      <fieldset className="mb_20">
                        <select
                          className=""
                          name="city"
                          tabIndex={2}
                          aria-required="true"
                          required
                          defaultValue={address.city}
                          onChange={(e) => {
                            setEditSelectedCityById((prev) => ({
                              ...prev,
                              [address.id]: e.target.value,
                            }));
                          }}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            backgroundColor: "white",
                          }}
                        >
                          <option value="">
                            {t("selectState")}*
                          </option>
                          {cities?.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </fieldset>
                      {cities
                        ?.find(
                          (c) =>
                            String(c.id) ===
                            String(
                              editSelectedCityById[address.id] ||
                              address.city
                            )
                        )
                        ?.states &&
                        cities
                          .find(
                            (c) =>
                              String(c.id) ===
                              String(
                                editSelectedCityById[address.id] ||
                                address.city
                              )
                          )
                          .states.length > 0 && (
                          <fieldset className="mb_20">
                            <select
                              className=""
                              name="state"
                              tabIndex={2}
                              aria-required="true"
                              required
                              defaultValue={address.state || ""}
                              disabled={
                                !(
                                  editSelectedCityById[address.id] ||
                                  address.city
                                )
                              }
                              style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px",
                                backgroundColor: "white",
                              }}
                            >
                              <option value="">
                                {t("selectCity")}
                                *
                              </option>
                              {cities
                                ?.find(
                                  (c) =>
                                    String(c.id) ===
                                    String(
                                      editSelectedCityById[address.id] ||
                                      address.city
                                    )
                                )
                                ?.states?.map((state) => (
                                  <option key={state.id} value={state.id}>
                                    {getStateName(state)}
                                  </option>
                                ))}
                            </select>
                          </fieldset>
                        )}
                      <fieldset className="mb_20">
                        <input
                          type="text"
                          placeholder={t(
                            "additionalPhone"
                          )}
                          name="home_phone"
                          defaultValue={address.home_phone || ""}
                        />
                      </fieldset>

                      <div className="d-flex flex-column gap-20">
                        <button
                          type="submit"
                          className="tf-btn btn-fill radius-4"
                          disabled={editMutation.isPending}
                        >
                          <span className="text">
                            {editMutation.isPending
                              ? t("updating")
                              : t("updateAddress")}
                          </span>
                        </button>
                        <span
                          onClick={() => handleEditToggle(address.id)}
                          className="tf-btn btn-fill radius-4 btn-hide-edit-address"
                        >
                          <span className="text">
                            {t("cancel")}
                          </span>
                        </span>
                      </div>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
