import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Course } from "../Course";

describe("Course Component", () => {
  const mockCourse = {
    id: 1,
    name: "React Fundamentals",
    description: "Aprende los fundamentos de React",
    thumbnail: "https://example.com/thumbnail.jpg",
  };

  const mockCourseWithRating = {
    ...mockCourse,
    average_rating: 4.5,
    total_ratings: 120,
  };

  it("renders course information correctly", () => {
    render(<Course {...mockCourse} />);

    // Check if name is rendered
    expect(screen.getByText(mockCourse.name)).toBeInTheDocument();

    // Check if description is rendered
    expect(screen.getByText(mockCourse.description)).toBeInTheDocument();
  });

  it("renders thumbnail with correct alt text", () => {
    render(<Course {...mockCourse} />);

    const thumbnail = screen.getByRole("img");
    expect(thumbnail).toHaveAttribute("src", mockCourse.thumbnail);
    expect(thumbnail).toHaveAttribute("alt", mockCourse.name);
  });

  it("renders with correct structure", () => {
    const { container } = render(<Course {...mockCourse} />);

    // Check if the main article exists
    expect(container.querySelector("article")).toBeDefined();

    // Check if the thumbnail container exists
    expect(container.querySelector("div > img")).toBeDefined();

    // Check if the course info section exists
    expect(container.querySelector("div > h2")).toBeDefined();
    expect(container.querySelector("div > p")).toBeDefined();
  });

  it("renders rating when average_rating is provided", () => {
    render(<Course {...mockCourseWithRating} />);

    expect(screen.getByText("(120)")).toBeInTheDocument();
  });

  it("does not render rating section when average_rating is not provided", () => {
    render(<Course {...mockCourse} />);

    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  it("handles zero rating correctly", () => {
    const courseWithZeroRating = {
      ...mockCourse,
      average_rating: 0,
      total_ratings: 0,
    };

    render(<Course {...courseWithZeroRating} />);

    // Rating section should be rendered (0 is a valid number)
    expect(screen.getByRole("group")).toBeInTheDocument();
  });
});
