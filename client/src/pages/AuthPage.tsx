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
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";


export default function AuthPage() {
  const { t } = useTranslation();

  // Login form schema
  const loginSchema = z.object({
    usernameOrEmail: z.string().min(3, { message: t("usernameOrEmailMinLength") }),
    password: z.string().min(6, { message: t("passwordMinLength") }),
  });

  const registerSchema = z.object({
    username: z.string().min(3, { message: t("usernameMinLength") }),
    email: z.string().email({ message: t("validEmail") }),
    password: z.string().min(6, { message: t("passwordMinLength") }),
    confirmPassword: z.string().min(6, { message: t("passwordMinLength") }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("passwordsDoNotMatch"),
    path: ["confirmPassword"],
  });

  type LoginFormValues = z.infer<typeof loginSchema>;
  type RegisterFormValues = z.infer<typeof registerSchema>;


  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData as any);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Auth forms */}
      <div className="flex items-center justify-center w-full md:w-1/2 ">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center md:hidden">{t("myWallet")}</h1>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">{t("login")}</TabsTrigger>
              <TabsTrigger value="register">{t("register")}</TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
              {/* Login form */}
              {activeTab === "login" && (
                <TabsContent value="login">
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("loginToAccount")}</CardTitle>
                        <CardDescription>
                          {t("enterCredentials")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="usernameOrEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("usernameOrEmail")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      placeholder={t("enterUsernameOrEmail")}
                                      disabled={loginMutation.isLoading}
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
                                  <FormLabel>{t("password")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder={t("enterPassword")}
                                      disabled={loginMutation.isLoading}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              className="w-full !bg-primary"
                              disabled={loginMutation.isLoading}
                            >
                              {loginMutation.isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              {t("login")}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                      <CardFooter className="flex flex-col items-center">
                        <div className="text-sm text-muted-foreground">
                          {t("noAccount")}
                          <Button
                            variant="link"
                            className="pl-1 pr-0"
                            onClick={() => setActiveTab("register")}
                          >
                            {t("signUp")}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>)}

              {/* Register form */}
              {activeTab === "register" && (
                <TabsContent value="register">
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("createAccount")}</CardTitle>
                        <CardDescription>
                          {t("registerToStart")}
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
                                  <FormLabel>{t("username")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      placeholder={t("chooseUsername")}
                                      disabled={registerMutation.isLoading}
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
                                  <FormLabel>{t("email")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      placeholder={t("enterEmail")}
                                      disabled={registerMutation.isLoading}
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
                                  <FormLabel>{t("password")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder={t("createPassword")}
                                      disabled={registerMutation.isLoading}
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
                                  <FormLabel>{t("confirmPassword")}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder={t("confirmPasswordPlaceholder")}
                                      disabled={registerMutation.isLoading}
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
                              disabled={registerMutation.isLoading}
                            >
                              {registerMutation.isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              {t("register")}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                      <CardFooter className="flex flex-col items-center">
                        <div className="text-sm text-muted-foreground">
                          {t("haveAccount")}
                          <Button
                            variant="link"
                            className="pl-1 pr-0"
                            onClick={() => setActiveTab("login")}
                          >
                            {t("signIn")}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
      {/* Hero section */}
      <div className="hidden md:flex w-1/2 bg-primary/10 items-center justify-center p-10">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t("myWallet")}</h1>
          <p className="text-xl text-muted-foreground mb-6">
            {t("aSimpleSecureWay")}
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-sm">✓</span>
              </div>
              <span>{t("trackExpensesIncome")}</span>
            </li>
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-sm">✓</span>
              </div>
              <span>{t("createManageBudgets")}</span>
            </li>
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-sm">✓</span>
              </div>
              <span>{t("visualizeSpending")}</span>
            </li>
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <span className="text-primary text-sm">✓</span>
              </div>
              <span>{t("accessDataAnytime")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}