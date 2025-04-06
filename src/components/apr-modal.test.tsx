import { screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UseQueryResult } from "@tanstack/react-query";

import { AprModal } from "./apr-modal";
import { useAPRForDuration } from "@/lib/hooks/use-apr-for-duration";
import { customRender } from "@/test/utils";

// Mock the hooks
vi.mock("@/lib/hooks/use-apr-for-duration", () => ({
  useAPRForDuration: vi.fn().mockReturnValue({
    data: 0.1, // 10% APR
    isLoading: false,
    isError: false,
    error: null,
    isPending: false,
  }),
}));

vi.mock("@/services/staking/get-rewards-token", () => ({
  useGetRewardsToken: vi.fn().mockReturnValue({
    data: {
      symbol: "TOKEN",
      decimals: 9,
    },
    isLoading: false,
    isError: false,
  }),
}));

describe("AprModal", () => {
  it("renders the modal trigger button", () => {
    customRender(<AprModal />);
    expect(screen.getByText("See APR")).toBeInTheDocument();
  });

  it("opens the modal when clicking the trigger", () => {
    customRender(<AprModal />);
    const trigger = screen.getByText("See APR");
    fireEvent.click(trigger);
    expect(screen.getByText("APR by Duration")).toBeInTheDocument();
  });

  it("displays APR information for different durations", () => {
    customRender(<AprModal />);
    const trigger = screen.getByText("See APR");
    fireEvent.click(trigger);

    expect(screen.getByText("3 Months")).toBeInTheDocument();
    expect(screen.getByText("1 Year")).toBeInTheDocument();
    expect(screen.getByText("2 Years")).toBeInTheDocument();
    expect(screen.getByText("4 Years")).toBeInTheDocument();
  });

  it("shows loading state when data is loading", () => {
    // Mock loading state
    vi.mocked(useAPRForDuration).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as UseQueryResult<number, Error>);

    customRender(<AprModal />);
    const trigger = screen.getByText("See APR");
    fireEvent.click(trigger);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("closes the modal when clicking the close button", () => {
    customRender(<AprModal />);
    const trigger = screen.getByText("See APR");
    fireEvent.click(trigger);

    const closeButton = screen.getByTestId("dialog-close");
    fireEvent.click(closeButton);

    expect(screen.queryByText("APR by Duration")).not.toBeInTheDocument();
  });
});
