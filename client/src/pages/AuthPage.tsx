import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/ui/i18n-provider";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();

  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle registration form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    // Cast the data to InsertUser type since we need to handle the required fields
    registerMutation.mutate(registerData as any);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Hero section */}
      <div className="hidden md:flex w-1/2 bg-primary/10 items-center justify-center p-10">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t("My Wallet")}</h1>
          <p className="text-xl text-muted-foreground mb-6">
            {t("A simple, secure way to manage your personal finances.")}
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-sm">✓</span>
              </div>
              <span>{t("Track your expenses and income")}</span>
            </li>
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-sm">✓</span>
              </div>
              <span>{t("Create and manage budgets")}</span>
            </li>
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-sm">✓</span>
              </div>
              <span>{t("Visualize your spending habits")}</span>
            </li>
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-sm">✓</span>
              </div>
              <span>{t("Access your data anytime, anywhere")}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Auth forms */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center md:hidden">{t("My Wallet")}</h1>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">{t("Login")}</TabsTrigger>
              <TabsTrigger value="register">{t("Register")}</TabsTrigger>
            </TabsList>
            
            {/* Login form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Login to your account")}</CardTitle>
                  <CardDescription>
                    {t("Enter your username and password to access your wallet")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Username")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("Enter your username")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Password")}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t("Enter your password")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t("Login")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <div className="text-sm text-muted-foreground">
                    {t("Don't have an account?")}
                    <Button
                      variant="link"
                      className="pl-1 pr-0"
                      onClick={() => setActiveTab("register")}
                    >
                      {t("Sign up")}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Create an account")}</CardTitle>
                  <CardDescription>
                    {t("Register to start tracking your finances")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Username")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("Choose a username")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Email")}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={t("Enter your email")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Password")}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t("Create a password")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Confirm Password")}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t("Confirm your password")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t("Register")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <div className="text-sm text-muted-foreground">
                    {t("Already have an account?")}
                    <Button
                      variant="link"
                      className="pl-1 pr-0"
                      onClick={() => setActiveTab("login")}
                    >
                      {t("Sign in")}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}