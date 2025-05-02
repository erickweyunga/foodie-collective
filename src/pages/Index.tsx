import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import MenuCard from "@/components/MenuCard";
import OrderSummary from "@/components/OrderSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Star, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  "Wali Nyama Mchuzi",
  "Wali Nyama Kavu",
  "Wali Maini",
  "Ugali Nyama",
  "Pilau Nyama Kavu",
  "Pilau Nyama Mchuzi",
  "Ugali Dagaa",
];

// Get a random menu item for the order of the day
const getOrderOfTheDay = () => {
  const date = new Date();
  // Use the day of the month to select an item (ensures consistency for the day)
  const dayOfMonth = date.getDate();
  const index = dayOfMonth % menuItems.length;
  return menuItems[index];
};

const orderOfTheDay = getOrderOfTheDay();

const Index = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [alreadyOrdered, setAlreadyOrdered] = useState(false);
  const [existingOrderId, setExistingOrderId] = useState<string | null>(null);
  const [checkingOrder, setCheckingOrder] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already ordered today
    const checkExistingOrder = async () => {
      setCheckingOrder(true);

      // First try to get the name from localStorage
      const storedName = localStorage.getItem("neurotech-name");
      if (storedName) {
        setName(storedName);

        // Check if this user has already placed an order today
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const { data, error } = await supabase
            .from("orders")
            .select("id, items")
            .eq("name", storedName)
            .gte("timestamp", today.toISOString())
            .order("timestamp", { ascending: false })
            .limit(1);

          if (error) {
            console.error("Error checking existing order:", error);
          } else if (data && data.length > 0) {
            setAlreadyOrdered(true);
            setExistingOrderId(data[0].id);
            // Pre-fill the selected items with the existing order
            setSelectedItems(data[0].items);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }

      setCheckingOrder(false);
    };

    checkExistingOrder();
  }, []);

  const handleMenuItemClick = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (item: string) => {
    setSelectedItems(selectedItems.filter((i) => i !== item));
  };

  const handleAddOrderOfTheDay = () => {
    if (!selectedItems.includes(orderOfTheDay)) {
      setSelectedItems([...selectedItems, orderOfTheDay]);
      toast({
        title: "Added to your order",
        description: `${orderOfTheDay} has been added to your selection`,
      });
    } else {
      toast({
        title: "Already in your order",
        description: `${orderOfTheDay} is already in your selection`,
        variant: "destructive",
      });
    }
  };

  const handleResetOrder = () => {
    setAlreadyOrdered(false);
    setExistingOrderId(null);
    setSelectedItems([]);
    toast({
      title: "Order Reset",
      description: "You can now place a new order for today",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one menu item",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save name to localStorage for future use
      localStorage.setItem("neurotech-name", name);

      let operation;

      if (alreadyOrdered && existingOrderId) {
        // Update existing order
        operation = supabase
          .from("orders")
          .update({
            items: selectedItems,
            timestamp: new Date().toISOString(), // Update timestamp to current time
          })
          .eq("id", existingOrderId);
      } else {
        // Insert new order
        operation = supabase.from("orders").insert({
          name,
          items: selectedItems,
        });
      }

      const { error } = await operation;

      if (error) {
        console.error("Error submitting order:", error);
        toast({
          title: "Error",
          description:
            "There was a problem submitting your order. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // For backwards compatibility, still save in localStorage
      localStorage.setItem(
        "neurotech-order",
        JSON.stringify({
          name,
          items: selectedItems,
          timestamp: new Date().toISOString(),
        })
      );

      toast({
        title: alreadyOrdered ? "Order Updated" : "Order Submitted",
        description: alreadyOrdered
          ? "Your order has been successfully updated!"
          : "Your order has been successfully submitted!",
      });

      navigate("/thank-you");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          "There was a problem submitting your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-4">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Food Order System
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="text-shadow">Neurotech.Africa</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Select your meal preferences from our Tanzania menu
          </p>

          {alreadyOrdered && (
            <div className="mt-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-3 rounded-md inline-flex items-center gap-2">
              <p>
                You've already placed an order today. You can modify and
                resubmit it.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800"
                onClick={handleResetOrder}
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Reset
              </Button>
            </div>
          )}
        </div>

        {/* Order of the Day Section */}
        <div className="mb-4">
          <Card className="border border-border overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-3">
              <div className="flex items-center gap-2 text-primary mb-1">
                <CalendarDays className="h-5 w-5" />
                <CardTitle className="text-xl">Order of the Day</CardTitle>
              </div>
              <CardDescription>Today's special recommendation</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-lg">{orderOfTheDay}</p>
                    <p className="text-muted-foreground text-sm">
                      Special for {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAddOrderOfTheDay}
                  variant="outline"
                  className="bg-primary/5 hover:bg-primary/10"
                >
                  Add to Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {checkingOrder ? (
          <div className="text-center p-8">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-border border-t-transparent rounded-full mb-4"></div>
            <p>Loading your order information...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white border border-border rounded-xl p-5">
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
                required
                disabled={alreadyOrdered}
              />
            </div>

            <div className="space-y-3 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Available Menu Items
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item, index) => (
                  <MenuCard
                    key={item}
                    title={item}
                    selected={selectedItems.includes(item)}
                    onSelect={() => handleMenuItemClick(item)}
                    index={index}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                type="submit"
                className="px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105"
              >
                {alreadyOrdered ? "Update Order" : "Submit Order"}
              </Button>
            </div>
          </form>
        )}

        <OrderSummary
          selectedItems={selectedItems}
          onRemove={handleRemoveItem}
        />
      </div>
    </Layout>
  );
};

export default Index;
