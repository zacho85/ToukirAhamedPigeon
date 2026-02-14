import React from "react";
import Layout from "../Layout"; // using your existing Layout component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PublicInvitation = () => {
  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">
              Public Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You have been invited to join our platform. Please log in or
              register to accept your invitation.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="default" asChild>
                <a href="/login">Login</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/register">Register</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PublicInvitation;
