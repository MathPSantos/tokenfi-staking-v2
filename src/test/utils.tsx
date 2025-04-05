import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RenderOptions } from "@testing-library/react";
import { render, renderHook } from "@testing-library/react";

const queryClient = new QueryClient();
export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export const customRender = (ui: React.ReactNode, options?: RenderOptions) => {
  return render(ui, { wrapper: wrapper, ...options });
};

export const customRenderHook = (
  hook: Parameters<typeof renderHook>[0],
  options?: RenderOptions
): ReturnType<typeof renderHook> => {
  return renderHook(hook, { wrapper: wrapper, ...options });
};
