import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ breadcrumbs }) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      {breadcrumbs.map((item, i) => (
        <span key={i} className="flex items-center">
          {item.href ? (
            <Link to={item.href} className="hover:underline text-primary">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}